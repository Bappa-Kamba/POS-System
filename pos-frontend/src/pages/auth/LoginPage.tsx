import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { z } from 'zod';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      const payload = await authService.login(values);
      setSession(payload);
      
      // Determine redirect based on role or saved location
      const savedPath = (location.state as { from?: Location })?.from?.pathname;
      let redirectTo = savedPath;
      
      if (!redirectTo) {
        // Default redirect based on role
        redirectTo = payload.user.role === 'ADMIN' ? '/dashboard' : '/pos';
      }
      
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ??
        'Unable to sign in. Please check your credentials.';
      setApiError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Sign in</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Enter your credentials to access the POS dashboard.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              placeholder="admin"
              autoComplete="username"
            />
            {errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>

          {apiError && <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

