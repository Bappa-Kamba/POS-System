import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { licenseService } from '../services/license.service';

export const UnlockPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { license, checkAuthStatus } = useAuthStore();
  const navigate = useNavigate();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await licenseService.unlock(code);
      await checkAuthStatus(); // Refresh global license state
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response.data.message || 'Invalid activation code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <KeyRound className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-2">
          System Activation
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-center mb-8">
          {license?.status === 'EXPIRED' 
            ? 'Your trial has expired. Please enter the activation code provided by your vendor to resume full access.'
            : 'Enter your license key to activate the full version of the system.'}
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Unlock Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="POS-XXXX-XXXX"
              className="w-full px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono uppercase"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Validating...' : <><ShieldCheck className="w-5 h-5" /> Activate System</>}
          </button>
        </form>

        <button 
          onClick={() => navigate(-1)}
          className="mt-6 mb-6 w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back (Read-Only Mode)
        </button>

        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t border-neutral-200 dark:border-neutral-700 text-center">
          <p className="text-xs text-neutral-500">
            Need a code? Contact support with your Shop Code: <span className="font-bold">MAMMAN_KANO</span>
          </p>
        </div>
      </div>
    </div>
  );
};
