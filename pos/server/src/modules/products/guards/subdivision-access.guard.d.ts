import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SubdivisionAccessGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean;
}
