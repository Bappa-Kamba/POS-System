import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FindAllAuditLogsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query() findAllAuditLogsDto: FindAllAuditLogsDto) {
    const result = await this.auditService.findAll(findAllAuditLogsDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const log = await this.auditService.findOne(id);
    return {
      success: true,
      data: log,
    };
  }

  @Get('entity/:entity/:entityId')
  async findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    const logs = await this.auditService.findByEntity(entity, entityId);
    return {
      success: true,
      data: logs,
    };
  }
}
