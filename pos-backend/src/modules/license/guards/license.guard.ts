import { Injectable } from "@nestjs/common";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { LicenseService } from "../license.service";
import { ForbiddenException } from "@nestjs/common";

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private licenseService: LicenseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // WHITELIST: Always allow these paths regardless of license status
    const isWhitelisted = [
      '/api/v1/auth',    // Allow login, refresh token, logout
      '/api/v1/license', // Allow status check and unlocking
    ].some(path => request.url.includes(path));

    if (isWhitelisted) {
      return true;
    }

    const { isExpired } = await this.licenseService.checkLicenseState();

    if (isExpired) {
      // Read-only enforcement: Only allow GET requests
      if (request.method === 'GET') return true;

      // Block all Mutations (POST, PUT, DELETE, PATCH)
      throw new ForbiddenException({
        message: 'License expired. System is in read-only mode.',
        errorCode: 'LICENSE_EXPIRED',
      });
    }

    return true;
  }
}
