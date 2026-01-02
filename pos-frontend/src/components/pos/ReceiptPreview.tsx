import React from 'react';
import { X, Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printReceipt, type ReceiptData } from '../../services/print.service';

interface ReceiptPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  if (!receiptData) {
    return null;
  }

  const handlePrint = () => {
    printReceipt(receiptData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt" size="lg">
      <div className="p-6">
        {/* Receipt Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 max-w-md mx-auto">
          {/* Business Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {receiptData.business.name}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {receiptData.business.address}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {receiptData.business.phone}
            </p>
            {receiptData.branch && receiptData.branch !== receiptData.business.name && (
              <>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                  A subsidiary of:
                </p>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                  {receiptData.branch}
                </p>
              </>
            )}
          </div>

          <div className="border-t border-b border-neutral-200 dark:border-neutral-700 py-4 my-4">
            {/* Transaction Type Badge */}
            <div className="text-center mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  receiptData.transactionType === 'CASHBACK'
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}
              >
                {receiptData.transactionType === 'CASHBACK' ? 'CASHBACK' : 'PURCHASE'}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">
                Receipt #:
              </span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {receiptData.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">
                Date:
              </span>
              <span className="text-neutral-900 dark:text-neutral-100">
                {formatDate(receiptData.date, 'datetime')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Cashier:
              </span>
              <span className="text-neutral-900 dark:text-neutral-100">
                {receiptData.cashier}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
                    Item
                  </th>
                  <th className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
                    Qty
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
                    Price
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <td className="py-2 text-sm text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </td>
                    <td className="py-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-sm text-neutral-600 dark:text-neutral-400">
                      {formatCurrency(item.unitPrice, receiptData.currency)}
                    </td>
                    <td className="py-2 text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(item.total, receiptData.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-b border-neutral-200 dark:border-neutral-700 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Subtotal:
              </span>
              <span className="text-neutral-900 dark:text-neutral-100">
                {formatCurrency(receiptData.subtotal, receiptData.currency)}
              </span>
            </div>
            {receiptData.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Tax:
                </span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(receiptData.tax, receiptData.currency)}
                </span>
              </div>
            )}
            {receiptData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Discount:
                </span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  -{formatCurrency(
                    receiptData.discount,
                    receiptData.currency
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-900 dark:text-neutral-100">
                TOTAL:
              </span>
              <span className="text-primary-600 dark:text-primary-400">
                {formatCurrency(receiptData.total, receiptData.currency)}
              </span>
            </div>
          </div>

          {/* Payments */}
          <div className="mt-4 space-y-2">
            {receiptData.payments.map((payment, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <span className="text-neutral-600 dark:text-neutral-400">
                  {payment.method}:
                </span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(payment.amount, receiptData.currency)}
                </span>
              </div>
            ))}
            {receiptData.change > 0 && (
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Change:
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(receiptData.change, receiptData.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {receiptData.footer}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-center">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

