import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface ReLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReLoginModal: React.FC<ReLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;

    setIsLoading(true);
    setError('');

    try {
      const payload = await authService.login({
        username: user.username,
        password,
        keepSessionAlive: true,
      });

      setSession(payload);
      toast.success('Session extended successfully');
      setPassword('');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      toast.error('Failed to extend session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Expiring"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-neutral-600 dark:text-neutral-300">
          Your session is about to expire. Please re-enter your password to continue working without interruption.
        </p>
        
        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Logged in as</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-200">{user?.username || 'Unknown User'}</p>
        </div>

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={error}
          autoFocus={isOpen}
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Dismiss
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            Extend Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};
