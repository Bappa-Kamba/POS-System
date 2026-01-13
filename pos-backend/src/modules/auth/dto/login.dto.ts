import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsBoolean()
  keepSessionAlive?: boolean;
}
