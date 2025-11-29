import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  IsUUID,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @IsUUID()
  @IsOptional()
  assignedSubdivisionId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
