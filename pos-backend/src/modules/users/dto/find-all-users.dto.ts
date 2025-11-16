import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class FindAllUsersDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  take?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle 'all' string explicitly - return a special marker
    if (value === 'all' || value === null || value === '') {
      return 'ALL'; // Special marker to indicate "all" was requested
    }
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @ValidateIf((o: FindAllUsersDto) => {
    return o.isActive !== undefined && o.isActive !== 'ALL';
  })
  @IsBoolean()
  isActive?: boolean | string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
