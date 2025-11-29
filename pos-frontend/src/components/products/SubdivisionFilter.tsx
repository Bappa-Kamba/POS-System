import { useAuthStore } from '../../store/authStore';
import { SubdivisionLabels, SubdivisionColors, ProductSubdivision } from '../../types/subdivision';
import { useAccessibleSubdivisions, useUserSubdivisionLabel } from '../../hooks/useCanAccessProduct';

/**
 * Component to display current user's subdivision assignment
 * Visible to both ADMIN (showing all) and CASHIER (showing assigned only)
 */
export const SubdivisionFilter = () => {
  const user = useAuthStore((state: any) => state.user);
  const accessibleSubdivisions = useAccessibleSubdivisions();
  const subdivisionLabel = useUserSubdivisionLabel();

  const isAdmin = user?.role === 'ADMIN';
  const isCashier = user?.role === 'CASHIER';

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Branch
          </p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {user.branchName || user.branchId}
          </p>
        </div>

        {isCashier && (
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Managing
            </p>
            <div
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                SubdivisionColors[user.assignedSubdivision as ProductSubdivision] ||
                'bg-gray-100 text-gray-700'
              }`}
            >
              {subdivisionLabel}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Accessible Subdivisions
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              {accessibleSubdivisions.map((subdivision: ProductSubdivision) => (
                <div
                  key={subdivision}
                  className={`px-2 py-1 rounded text-xs font-medium ${SubdivisionColors[subdivision]}`}
                >
                  {SubdivisionLabels[subdivision]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdivisionFilter;
