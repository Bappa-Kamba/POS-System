import { ProductSubdivision } from "./subdivision";

export type UserRole = "ADMIN" | "CASHIER";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  branchId: string;
  branchName?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  assignedSubdivision?: ProductSubdivision | null;
}
