import { Module } from '@nestjs/common';
import { VariantsService } from './variants.service';
import {
  VariantsController,
  VariantsGlobalController,
} from './variants.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VariantsController, VariantsGlobalController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
