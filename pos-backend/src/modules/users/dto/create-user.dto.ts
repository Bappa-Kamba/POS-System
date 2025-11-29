import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRole, ProductSubdivision } from '@prisma/client';

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

  @IsEnum(ProductSubdivision)
  @IsOptional()
  assignedSubdivision?: ProductSubdivision;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
