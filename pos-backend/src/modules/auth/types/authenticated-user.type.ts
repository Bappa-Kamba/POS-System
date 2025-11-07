import { UserRole } from '@prisma/client';

export interface AuthenticatedRequestUser {
  id: string;
  username: string;
  role: UserRole;
  branchId: string;
}
