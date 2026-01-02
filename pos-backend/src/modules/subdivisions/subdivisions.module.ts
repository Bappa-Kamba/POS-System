import { Module } from '@nestjs/common';
import { SubdivisionsController } from './subdivisions.controller';
import { SubdivisionsService } from './subdivisions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [SubdivisionsController],
  providers: [SubdivisionsService],
  exports: [SubdivisionsService],
})
export class SubdivisionsModule {}
