import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';
import type { Payment } from '../../services/sale.service';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (payment: Payment) => Promise<void> | void;
  allowCreditSale?: boolean;
  onCreditSale?: (customerInfo: { name?: string; phone?: string }) => Promise<void>;
  isSettlement?: boolean;
}

type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  onComplete,
  allowCreditSale,
  onCreditSale,
  isSettlement,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Set amount to total when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(total.toString());
      setReference('');
      setActiveMethod('CASH');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setIsCreditSale(false);
      setCustomerName('');
      setCustomerPhone('');
    }
  }, [isOpen, total]);

  const paymentAmount = parseFloat(amount) || 0;
  const change = paymentAmount > total ? paymentAmount - total : 0;
  const isAmountValid = paymentAmount >= total;
  const isCustomerInfoValid = customerName.trim() || customerPhone.trim();

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
    // Prevent double submission
    if (isSubmittingRef.current) return;

    // Handle credit sale
    if (isCreditSale) {
      if (!isCustomerInfoValid) {
        toast.error('Please provide customer name or phone number for credit sale.');
        return;
      }

      setIsSubmitting(true);
      isSubmittingRef.current = true;

      try {
        if (onCreditSale) {
          await onCreditSale({
            name: customerName.trim() || undefined,
            phone: customerPhone.trim() || undefined,
          });
        }
      } catch (error) {
        console.error('Credit sale failed', error);
        toast.error('Sale failed');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
      return;
    }

    // Handle regular payment
    if (!isSettlement && !isAmountValid) {
      toast.error(`Insufficient payment. ${formatCurrency(total - paymentAmount)} remaining.`);
      return;
    }

    const paymentData: Payment = {
      method: activeMethod,
      amount: paymentAmount,
      reference: reference || undefined,
      isSettlement,
    };

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      await onComplete(paymentData);
    } catch (error) {
      console.error('Payment failed', error);
      toast.error('Payment failed');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
    
    if (isOpen) {
       setIsSubmitting(false);
       isSubmittingRef.current = false;
    }
  };

  const handleClose = () => {
    if (isSubmittingRef.current) return;
    setAmount('');
    setReference('');
    setActiveMethod('CASH');
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setIsCreditSale(false);
    setCustomerName('');
    setCustomerPhone('');
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
          {!isCreditSale && paymentAmount > 0 && (
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

        {/* Credit Sale Toggle */}
        {allowCreditSale && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCreditSale}
                onChange={(e) => setIsCreditSale(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Credit (Pay Later)
              </span>
            </label>
          </div>
        )}

        {/* Customer Info (shown when credit sale is enabled) */}
        {isCreditSale && (
          <div className="space-y-3 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              Customer information required for credit sales
            </p>
            <Input
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
            <Input
              label="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        )}

        {/* Payment Method Tabs - Hidden for credit sales */}
        {!isCreditSale && (
          <>
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
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={
              isSubmitting ||
              (isCreditSale ? !isCustomerInfoValid : isSettlement ? false : !isAmountValid)
            }
            className="flex-1"
            respectLicense
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isCreditSale ? (
              'Create Credit Sale'
            ) : (
              'Complete Sale'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
