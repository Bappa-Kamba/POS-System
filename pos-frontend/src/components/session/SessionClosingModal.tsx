import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';

interface SessionClosingModalProps {
  isOpen: boolean;
  isLoading: boolean;
  closingBalance: string;
  onClosingBalanceChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  sessionName?: string;
  openingBalance?: number;
}

export const SessionClosingModal: React.FC<SessionClosingModalProps> = ({
  isOpen,
  isLoading,
  closingBalance,
  onClosingBalanceChange,
  onConfirm,
  onCancel,
  sessionName = 'Current',
  openingBalance = 0,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="End Session Before Logout">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Active Session Detected</p>
            <p>
              You have an active <strong>{sessionName}</strong> session. 
              Please count the cash in drawer and enter the closing balance before logging out 
              to maintain complete audit records.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Session:</span>
            <span className="font-medium">{sessionName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Opening Balance:</span>
            <span className="font-medium">{formatCurrency(openingBalance)}</span>
          </div>
        </div>

        <div>
          <Input
            label="Closing Balance (Actual Cash in Drawer)"
            type="number"
            value={closingBalance}
            onChange={(e) => onClosingBalanceChange(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            autoFocus
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            This amount will be compared with expected cash to identify any discrepancies
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Keep Session Open
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !closingBalance}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ending Session...
              </>
            ) : (
              'End Session & Logout'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
