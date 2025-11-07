import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { logout, isAuthenticated } = useAuthStore();
  console.log('Redirected to DashboardPage', isAuthenticated)

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {user?.firstName ?? user?.username}! 🎉</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
      <p className="text-neutral-500">Use the sidebar (coming soon) to manage products, users, inventory, and reports.</p>
    </div>
  );
};

