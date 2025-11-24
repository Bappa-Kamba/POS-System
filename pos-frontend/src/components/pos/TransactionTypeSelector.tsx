import React from 'react';
import { ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { Button } from '../common/Button';

interface TransactionTypeSelectorProps {
  onSelect: (type: 'PURCHASE' | 'CASHBACK') => void;
}

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  onSelect,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Select Transaction Type
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Button
          onClick={() => onSelect('PURCHASE')}
          className="h-32 flex flex-col items-center justify-center gap-4"
          size="lg"
        >
          <ShoppingCart className="w-12 h-12" />
          <div className="text-center">
            <div className="text-xl font-semibold">Purchase</div>
            <div className="text-sm opacity-90 mt-1">
              Process product sales
            </div>
          </div>
        </Button>
        <Button
          onClick={() => onSelect('CASHBACK')}
          variant="secondary"
          className="h-32 flex flex-col items-center justify-center gap-4"
          size="lg"
        >
          <ArrowLeftRight className="w-12 h-12" />
          <div className="text-center">
            <div className="text-xl font-semibold">Cashback</div>
            <div className="text-sm opacity-90 mt-1">
              Provide cash service
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

