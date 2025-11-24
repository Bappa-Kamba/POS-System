import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, DollarSign } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';

interface CashbackFormProps {
  serviceChargeRate: number; // e.g., 0.02 for 2%
  availableCapital: number;
  onComplete: (amount: number, serviceCharge: number, totalReceived: number) => void;
  onCancel: () => void;
}

export const CashbackForm: React.FC<CashbackFormProps> = ({
  serviceChargeRate,
  availableCapital,
  onComplete,
  onCancel,
}) => {
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const cashbackAmount = parseFloat(amount) || 0;
  const serviceCharge = cashbackAmount * serviceChargeRate;
  const totalReceived = cashbackAmount + serviceCharge; // Customer sends this amount
  const isValid = cashbackAmount > 0 && cashbackAmount <= availableCapital;

  const handleSubmit = () => {
    if (!isValid) {
      alert(
        `Invalid amount. Must be between 0 and ${formatCurrency(availableCapital)}`,
      );
      return;
    }
    onComplete(cashbackAmount, serviceCharge, totalReceived);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Cashback Service
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Available Capital */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Available Capital:
            </span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(availableCapital)}
            </span>
          </div>
        </div>

        {/* Service Charge Info */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Service Charge Rate: {(serviceChargeRate * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Customer will send: Amount + Service Charge to your account
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Cash Amount to Give
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            max={availableCapital}
            step="0.01"
            className="text-lg font-semibold"
            autoFocus
          />
          {cashbackAmount > availableCapital && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Insufficient capital. Maximum: {formatCurrency(availableCapital)}
            </p>
          )}
        </div>

        {/* Customer Info (Optional) */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Customer Name (Optional)
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Customer Phone (Optional)
            </label>
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter customer phone"
            />
          </div>
        </div>

        {/* Calculation Summary */}
        {cashbackAmount > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 space-y-3 border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Transaction Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Amount to Give:
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(cashbackAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Service Charge ({(serviceChargeRate * 100).toFixed(2)}%):
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(serviceCharge)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Customer Sends:
                  </span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(totalReceived)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  Customer should transfer this amount to your account
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-900/50">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!isValid}
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Complete Cashback Transaction
        </Button>
      </div>
    </div>
  );
};

