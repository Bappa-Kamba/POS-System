import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Guard to verify user has access to product subdivision
 * ADMIN users can access all subdivisions
 * CASHIER users can only access their assigned subdivision
 */
@Injectable()
export class SubdivisionAccessGuard implements CanActivate {
  private readonly logger = new Logger(SubdivisionAccessGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ADMIN users have unrestricted access
    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    // CASHIER users must have an assigned subdivision
    if (user?.role === UserRole.CASHIER) {
      if (!user?.assignedSubdivisionId) {
        this.logger.warn(
          `Unauthorized subdivision access attempt by user ${user?.id}: no subdivision assigned`,
        );
        throw new ForbiddenException(
          'You have not been assigned to a product subdivision. Please contact your administrator.',
        );
      }
      return true;
    }

    this.logger.warn(`Invalid user role for subdivision access: ${user?.role}`);
    throw new ForbiddenException('Invalid user role');
  }
}
