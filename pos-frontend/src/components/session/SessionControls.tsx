import React, { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../ui/Card';
import { Play, Square, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

interface SessionControlsProps {
  onSuccess?: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({ onSuccess }) => {
  const { activeSession, refreshSession, isLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [sessionName, setSessionName] = useState<'Morning' | 'Evening'>('Morning');

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      await api.post('/sessions/start', {
        name: sessionName,
        openingBalance: parseFloat(openingBalance) || 0,
      });
      toast.success('Session started successfully');
      await refreshSession();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start session');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } 
    // Success path might redirect/refresh, but safest to reset if component stays mounted
    // We don't blindly reset in finally because success might unmount/change state
    if (!onSuccess) { // If no callback, we might stay here
       setIsSubmitting(false);
       isSubmittingRef.current = false;
    }
  };

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    if (isSubmittingRef.current) return;
    
    if (!window.confirm('Are you sure you want to end the current session?')) {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end session');
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }

  if (!activeSession) {
    return (
      <Card className="p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Start New Session</h3>
        <form onSubmit={handleStartSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sessionName"
                  value="Morning"
                  checked={sessionName === 'Morning'}
                  onChange={() => setSessionName('Morning')}
                  className="mr-2"
                />
                Morning
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sessionName"
                  value="Evening"
                  checked={sessionName === 'Evening'}
                  onChange={() => setSessionName('Evening')}
                  className="mr-2"
                />
                Evening
              </label>
            </div>
          </div>
          
          <Input
            label="Opening Balance (Cash in Drawer)"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          <Button type="submit" disabled={isSubmitting} className="w-full" respectLicense>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Start Session
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-green-50 border border-green-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-green-800">Active Session: {activeSession.name}</h3>
          <p className="text-sm text-green-600">
            Started at {new Date(activeSession.startTime).toLocaleTimeString()} by {activeSession.openedBy.firstName}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Opening Balance: {formatCurrency(activeSession.openingBalance || 0)}
          </p>
        </div>
        <div className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
          OPEN
        </div>
      </div>

      <form onSubmit={handleEndSession} className="mt-4 pt-4 border-t border-green-200">
        <Input
          label="Closing Balance (Counted Cash)"
          type="number"
          value={closingBalance}
          onChange={(e) => setClosingBalance(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          className="bg-white"
        />
        <Button variant="danger" type="submit" disabled={isSubmitting} className="w-full mt-3" respectLicense>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Square className="w-4 h-4 mr-2" />}
          End Session
        </Button>
      </form>
    </Card>
  );
};
