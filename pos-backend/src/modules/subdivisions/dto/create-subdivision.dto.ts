import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateSubdivisionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
