import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-3xl font-semibold text-neutral-900">Access restricted</h1>
      <p className="text-neutral-600 max-w-md">
        You do not have permission to view this page. If you believe this is a mistake, contact an administrator.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
      >
        Go back to dashboard
      </Link>
    </div>
  );
};

