import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body } = request;

    // Determine action type from HTTP method
    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method];

    // Skip if no action or no user
    if (!action || !user) {
      return next.handle();
    }

    // Skip audit endpoints to avoid infinite loops
    if (url.includes('/audit-logs')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Extract entity info from URL
          const entity = this.extractEntity(url);
          const entityId = this.extractEntityId(url) || data?.id;

          // Get IP address and user agent
          const ipAddress =
            request.ip ||
            (request.headers['x-forwarded-for'] as string | undefined) ||
            request.connection?.remoteAddress ||
            undefined;
          const userAgent = request.headers['user-agent'] || undefined;

          // For UPDATE operations, try to get old values from the response if available
          let oldValues: string | undefined;
          if (action === AuditAction.UPDATE && data?.oldValues) {
            oldValues = typeof data.oldValues === 'string' 
              ? data.oldValues 
              : JSON.stringify(data.oldValues);
          }

          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action,
              entity,
              entityId: entityId as string | undefined,
              oldValues,
              newValues: body ? JSON.stringify(body) : undefined,
              ipAddress: ipAddress as string | undefined,
              userAgent: userAgent as string | undefined,
            },
          });
        } catch (error) {
          // Don't throw - audit logging failure shouldn't break the operation
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    // Remove API prefix if present
    const apiIndex = parts.findIndex((p) => p === 'api');
    const startIndex = apiIndex >= 0 ? apiIndex + 2 : 0;
    const entityPart = parts[startIndex] || parts[parts.length - 2] || 'unknown';
    // Capitalize first letter
    return entityPart.charAt(0).toUpperCase() + entityPart.slice(1).replace(/s$/, '');
  }

  private extractEntityId(url: string): string | null {
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
  }
}

