import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LicenseBanner = () => {
  const { license } = useAuthStore();
  const navigate = useNavigate();

  if (!license || license.status === 'ACTIVE') return null;

  const isExpired = license.status === 'EXPIRED';
  const daysLeft = Math.ceil(
    (new Date(license.trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`w-full py-2 px-4 flex items-center justify-center gap-4 text-sm font-medium transition-colors ${
      isExpired 
        ? 'bg-red-600 text-white' 
        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex items-center gap-2">
        {isExpired ? <Lock className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        <span>
          {isExpired 
            ? "System Locked: Your trial has expired. Access is now Read-Only." 
            : `Trial Mode: You have ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} remaining before the system locks.`
          }
        </span>
      </div>
      
      <button 
        onClick={() => navigate('/unlock')}
        className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
          isExpired 
            ? 'bg-white text-red-600 hover:bg-neutral-100' 
            : 'bg-amber-800 text-white hover:bg-amber-900'
        }`}
      >
        Activate Now
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
