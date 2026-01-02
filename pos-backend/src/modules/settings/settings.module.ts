import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { ReceiptResolutionService } from './receipt-resolution.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService, ReceiptResolutionService],
  exports: [SettingsService, ReceiptResolutionService],
})
export class SettingsModule {}
