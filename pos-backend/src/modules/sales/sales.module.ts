import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';

import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SessionsModule, SettingsModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
