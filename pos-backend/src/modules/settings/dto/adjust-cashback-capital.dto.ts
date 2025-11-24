import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class AdjustCashbackCapitalDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
