import { useAuthStore } from "../store/authStore";
import { ProductSubdivision } from "../types/subdivision";

/**
 * Hook to check if current user can access a product
 * ADMIN users can access all products
 * CASHIER users can only access products from their branch and subdivision
 */
export const useCanAccessProduct = (
  productSubdivision?: ProductSubdivision,
  productBranchId?: string
): boolean => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return false;
  }

  // ADMIN users can access all products
  if (user.role === "ADMIN") {
    return true;
  }

  // CASHIER users can only access their branch and subdivision
  if (user.role === "CASHIER") {
    return (
      productBranchId === user.branchId &&
      productSubdivision === user.assignedSubdivision
    );
  }

  return false;
};

/**
 * Hook to get current user's accessible subdivisions
 */
export const useAccessibleSubdivisions = (): ProductSubdivision[] => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return [];
  }

  // ADMIN can see all subdivisions
  if (user.role === "ADMIN") {
    return [
      ProductSubdivision.CASHBACK_ACCESSORIES,
      ProductSubdivision.FROZEN_DRINKS,
    ];
  }

  // CASHIER can only see their assigned subdivision
  if (user.role === "CASHIER" && user.assignedSubdivision) {
    return [user.assignedSubdivision];
  }

  return [];
};

/**
 * Hook to get human-readable subdivision name for current user
 */
export const useUserSubdivisionLabel = (): string => {
  const user = useAuthStore((state) => state.user);

  if (!user?.assignedSubdivision) {
    return "All Subdivisions";
  }

  return user.assignedSubdivision === ProductSubdivision.CASHBACK_ACCESSORIES
    ? "Cashback & Accessories"
    : "Frozen Products & Drinks";
};
