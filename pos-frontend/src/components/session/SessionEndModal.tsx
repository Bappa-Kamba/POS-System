import React, { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../ui/Card';
import { SessionSummaryReport } from './SessionSummaryReport';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SessionEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionEnded?: () => void; // Optional callback after session is successfully ended
}

export const SessionEndModal: React.FC<SessionEndModalProps> = ({ isOpen, onClose, onSessionEnded }) => {
  const { activeSession, refreshSession } = useSession();
  const [closingBalance, setClosingBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);

  if (!isOpen || !activeSession) return null;

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;

    if (!closingBalance) {
      toast.error('Please enter the closing balance');
      return;
    }

    if (!window.confirm('Are you sure you want to end the current session? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      await api.post(`/sessions/${activeSession.id}/end`, {
        closingBalance: parseFloat(closingBalance) || 0,
      });
      toast.success('Session ended successfully');
      await refreshSession();
      setClosingBalance('');
      onClose();
      onSessionEnded?.(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end session');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } 
    // Success case handles cleanup via onClose unmounting
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              End Session
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {activeSession.name} • Started at {new Date(activeSession.startTime).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left: Session Summary (2/3 width) */}
            <div className="lg:col-span-2">
              <SessionSummaryReport 
                sessionId={activeSession.id} 
                previewClosingBalance={closingBalance ? parseFloat(closingBalance) : undefined}
              />
            </div>

            {/* Right: Cash Count Form (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-2 border-blue-300 dark:border-blue-700">
                  <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                    Count Cash & Close Session
                  </h3>
                  <p className="text-sm text-neutral-600 mb-6">
                    Review the summary on the left, then count all cash in the drawer and enter the amount below.
                  </p>

                  <form onSubmit={handleEndSession} className="space-y-4 text-neutral-600">
                    <Input
                      label="Closing Balance (Counted Cash)"
                      type="text"
                      value={closingBalance}
                      onChange={(e) => setClosingBalance(e.target.value)}
                      placeholder="0.00"
                      required
                      className="text-lg font-semibold text-neutral-600"
                    />

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>⚠️ Important:</strong> This action cannot be undone. Ensure all transactions are complete.
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        type="submit"
                        variant="danger"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Ending Session...
                          </>
                        ) : (
                          'End Session'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
