import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LicenseStatus } from '@prisma/client';
import * as crypto from 'crypto';
@Injectable()
export class LicenseService implements OnModuleInit {
  private readonly logger = new Logger(LicenseService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeLicense();
  }

  private async initializeLicense() {
    const existing = await this.prisma.appLicense.findUnique({
      where: { id: 'SYSTEM_LICENSE' },
    });

    if (!existing) {
      const trialDays = this.config.get<number>('TRIAL_DAYS', 14);
      const shopCode = this.config.getOrThrow<string>('SHOP_CODE');
      const initialHash = this.config.getOrThrow<string>('LICENSE_UNLOCK_HASH');

      await this.prisma.appLicense.create({
        data: {
          id: 'SYSTEM_LICENSE',
          shopCode,
          unlockCodeHash: initialHash,
          trialExpiresAt: new Date(new Date().getTime() + trialDays * 24 * 60 * 60 * 1000),
          licenseStatus: LicenseStatus.TRIAL,
        },
      });
      this.logger.log(
        `[License] System initialized. Trial expires at: ${trialDays} days.`,
      );
    } else {
      this.logger.log(
        `[License] System already initialized. Trial expires at: ${existing.trialExpiresAt} days.`,
      );
    }

  }

  async getLicense() {
    return this.prisma.appLicense.findUnique({
      where: { id: 'SYSTEM_LICENSE' },
    });
  }

  async checkLicenseState() {
    const license = await this.getLicense();
    if (!license) return { isExpired: true, status: LicenseStatus.EXPIRED };

    if (license.licenseStatus === LicenseStatus.ACTIVE) {
      return { isExpired: false, status: LicenseStatus.ACTIVE };
    }

    // If the Status is explicitly EXPIRED, lock it (Precedence)
    if (license.licenseStatus === LicenseStatus.EXPIRED) {
      return { isExpired: true, status: LicenseStatus.EXPIRED };
    }

    const now = new Date();

    // Clock Rollback Protection
    if (now < license.lastCheckedAt) {
      await this.updateStatus(LicenseStatus.EXPIRED);
      return { isExpired: true, status: LicenseStatus.EXPIRED };
    }

    // Update Heartbeat
    await this.prisma.appLicense.update({
      where: { id: 'SYSTEM_LICENSE' },
      data: { lastCheckedAt: now },
    });

    if (now > license.trialExpiresAt) {
      await this.updateStatus(LicenseStatus.EXPIRED);
      return { isExpired: true, status: LicenseStatus.EXPIRED };
    }

    return { isExpired: false, status: LicenseStatus.TRIAL };
  }

  private async updateStatus(status: LicenseStatus) {
    await this.prisma.appLicense.update({
      where: { id: 'SYSTEM_LICENSE' },
      data: { licenseStatus: status },
    });
  }

  async activateWithUnlockCode(providedCode: string) {
    const license = await this.getLicense();
    if (!license || license.licenseStatus === LicenseStatus.ACTIVE)
      return false;

    // Normalize: Remove dashes, spaces, convert to uppercase
    const cleanCode = providedCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Hash the input (using SHA256 or bcrypt depending on how the vendor hash was generated)
    const inputHash = crypto
      .createHmac('sha256', license.shopCode)
      .update(cleanCode)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(license.unlockCodeHash),
      Buffer.from(inputHash),
    );

    if (isValid) {
      await this.prisma.appLicense.update({
        where: { id: 'SYSTEM_LICENSE' },
        data: {
          licenseStatus: LicenseStatus.ACTIVE,
          activatedAt: new Date(),
        },
      });
      return true;
    }
    return false;
  }
}
