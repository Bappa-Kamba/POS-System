import { IsDateString } from 'class-validator';

export class ProfitLossDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
