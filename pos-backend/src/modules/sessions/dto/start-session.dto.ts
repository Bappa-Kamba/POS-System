import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class StartSessionDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // "Morning", "Evening"

  @IsNumber()
  @IsOptional()
  openingBalance?: number;
}
