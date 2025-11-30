import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { SessionsService } from './sessions.service';
import { StartSessionDto, EndSessionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedRequestUser;
}

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async startSession(
    @Request() req: AuthenticatedRequest,
    @Body() dto: StartSessionDto,
  ) {
    const session = await this.sessionsService.startSession(
      req.user.branchId,
      req.user.id,
      dto,
    );
    return {
      success: true,
      data: session,
      message: 'Session started successfully',
    };
  }

  @Post(':id/end')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async endSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: EndSessionDto,
  ) {
    const session = await this.sessionsService.endSession(id, req.user.id, dto);
    return {
      success: true,
      data: session,
      message: 'Session ended successfully',
    };
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getActiveSession(@Request() req: AuthenticatedRequest) {
    const session = await this.sessionsService.getActiveSession(
      req.user.branchId,
      req.user.id,
    );
    return {
      success: true,
      data: session,
    };
  }

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getSessionHistory(@Request() req: AuthenticatedRequest) {
    const history = await this.sessionsService.getSessionHistory(
      req.user.branchId,
    );
    return {
      success: true,
      data: history,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getSessionDetails(@Param('id') id: string) {
    const session = await this.sessionsService.getSessionDetails(id);
    return {
      success: true,
      data: session,
    };
  }
}
