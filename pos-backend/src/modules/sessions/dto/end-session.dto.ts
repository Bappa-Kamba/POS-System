import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EndSessionDto {
  @IsNumber()
  @IsOptional()
  closingBalance?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
