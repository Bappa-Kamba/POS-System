export interface LoginDto {
  username: string;
  password: string;
  keepSessionAlive?: boolean;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

