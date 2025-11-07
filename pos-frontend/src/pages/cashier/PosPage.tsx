import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export const PosPage = () => {
  const { user } = useAuth();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Point of Sale</h1>
          <p className="text-neutral-600">Hello {user?.firstName ?? user?.username}, start scanning products to build a cart.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
      <p className="text-neutral-500">The full POS interface will live here in upcoming milestones.</p>
    </div>
  );
};

