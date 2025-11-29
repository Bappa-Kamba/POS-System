import { IsUUID } from 'class-validator';

export class AssignSubdivisionDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  subdivisionId!: string;
}
