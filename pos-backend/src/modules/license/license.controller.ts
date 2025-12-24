import { Controller, Get, HttpCode, Post, Body, ForbiddenException } from "@nestjs/common";
import { LicenseService } from "./license.service";

@Controller('license')
export class LicenseController {
  constructor(private licenseService: LicenseService) {}

  @Get('status')
  async getStatus() {
    const state = await this.licenseService.checkLicenseState();
    const license = await this.licenseService.getLicense();
    return {
      success: true,
      data: {
        status: state.status,
        trialExpiresAt: license?.trialExpiresAt,
        isReadOnly: state.isExpired
      }
    };
  }

  @Post('unlock')
  @HttpCode(200)
  async unlock(@Body('code') code: string) {
    const success = await this.licenseService.activateWithUnlockCode(code);
    if (!success) {
      throw new ForbiddenException('Invalid unlock code.');
    }
    return { success: true, message: 'System activated successfully.' };
  }
}
