import { CanActivate, ExecutionContext } from "@nestjs/common";
import { LicenseService } from "../license.service";
export declare class LicenseGuard implements CanActivate {
    private licenseService;
    constructor(licenseService: LicenseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
