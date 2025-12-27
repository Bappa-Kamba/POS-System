import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';
import type { Payment } from '../../services/sale.service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (payment: Payment) => Promise<void> | void;
}

type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  onComplete,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);

  // Set amount to total when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(total.toString());
      setReference('');
      setActiveMethod('CASH');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen, total]);

  const paymentAmount = parseFloat(amount) || 0;
  const change = paymentAmount > total ? paymentAmount - total : 0;
  const isAmountValid = paymentAmount >= total;

  const paymentMethods: Array<{
    value: PaymentMethod;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { value: 'CASH', label: 'Cash', icon: Banknote },
    { value: 'CARD', label: 'Card', icon: CreditCard },
    { value: 'TRANSFER', label: 'Transfer', icon: Smartphone },
  ];

  const handleCompleteSale = async () => {
    // Prevent double submission if already in progress (even if UI hasn't updated yet)
    if (isSubmittingRef.current) return;

    if (!isAmountValid) {
      alert(`Insufficient payment. ${formatCurrency(total - paymentAmount)} remaining.`);
      return;
    }

    if (activeMethod !== 'CASH' && !reference.trim()) {
      alert('Please enter a reference number');
      return;
    }

    const paymentData: Payment = {
      method: activeMethod,
      amount: paymentAmount,
      reference: reference || undefined,
    };

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      await onComplete(paymentData);
    } catch (error) {
      console.error('Payment failed', error);
      // Keep submitting false if error so user can retry
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
    // Note: If success, the parent will likely close this modal
    if (isOpen) {
       setIsSubmitting(false);
       isSubmittingRef.current = false;
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleClose = () => {
    if (isSubmittingRef.current) return; // Prevent closing while submitting
    setAmount('');
    setReference('');
    setActiveMethod('CASH');
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Payment" size="lg">
      <div className="p-6">
        {/* Amount Due */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              Total Amount:
            </span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(total)}
            </span>
          </div>
          {paymentAmount > 0 && (
            <>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-neutral-600 dark:text-neutral-300">
                  Amount Paid:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>
              {change > 0 && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Change:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
              {paymentAmount < total && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Remaining:
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(total - paymentAmount)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                onClick={() => setActiveMethod(method.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  activeMethod === method.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>

        {/* Payment Input */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Amount
            </label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons (Cash only) */}
          {activeMethod === 'CASH' && (
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded border border-neutral-300 dark:border-neutral-600 transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  {formatCurrency(amt)}
                </button>
              ))}
              <button
                onClick={() => setAmount(total.toString())}
                className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded border border-primary-300 dark:border-primary-700 transition-colors font-medium"
              >
                Exact
              </button>
            </div>
          )}

          {/* Reference Number (for Card and Transfer) */}
          {activeMethod !== 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Reference Number
              </label>
              <Input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter transaction reference"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={!isAmountValid || (activeMethod !== 'CASH' && !reference.trim()) || isSubmitting}
            className="flex-1"
            respectLicense
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Sale'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

