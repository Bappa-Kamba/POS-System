import { IsEnum, IsOptional } from 'class-validator';
import { SubdivisionStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubdivisionDto } from './create-subdivision.dto';

export class UpdateSubdivisionDto extends PartialType(CreateSubdivisionDto) {
  @IsEnum(SubdivisionStatus)
  @IsOptional()
  status?: SubdivisionStatus;
}
