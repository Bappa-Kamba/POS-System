import type { LicenseStatus } from '../services/license.service';
import type { AuthUser, UserRole } from './user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  user: AuthUser;
  tokens: AuthTokens;
  license: LicenseStatus;
}

export interface MeResponse {
  user: AuthUser;
}

export interface RefreshPayload {
  tokens: AuthTokens;
}

export interface DecodedJwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  branchId: string;
  exp: number;
  iat: number;
}

