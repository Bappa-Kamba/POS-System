import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import saleService, { type Sale, type AddPaymentPayload } from '../../services/sale.service';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';
import { Search, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreditSalesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Fetch credit sales
  const { data: salesResponse, isLoading } = useQuery({
    queryKey: ['credit-sales', user?.branchId],
    queryFn: () => saleService.getAll({
      creditStatus: 'OPEN',
      isCreditSale: true,
      branchId: user?.branchId,
    }),
    enabled: !!user?.branchId,
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: ({ saleId, payment }: { saleId: string; payment: AddPaymentPayload; }) =>
      saleService.addPayment(saleId, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-sales'] });
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setSelectedSale(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to add payment');
    },
  });

  const sales = salesResponse?.data || [];

  // Filter sales by search query
  const filteredSales = sales.filter((sale) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sale.receiptNumber.toLowerCase().includes(query) ||
      sale.customerName?.toLowerCase().includes(query) ||
      sale.customerPhone?.toLowerCase().includes(query)
    );
  });

  const handleSettle = (sale: Sale) => {
    setSelectedSale(sale);
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = async (payment: AddPaymentPayload) => {
    if (!selectedSale) return;
    
    await addPaymentMutation.mutateAsync({
      saleId: selectedSale.id,
      payment,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Credit Sales
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage outstanding credit sales and payments
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Outstanding Sales
              </p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {filteredSales.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(
                  filteredSales.reduce((sum, sale) => sum + sale.amountDue, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by receipt number, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">Loading credit sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {searchQuery ? 'No credit sales found matching your search' : 'No outstanding credit sales'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-medium text-primary-600 dark:text-primary-400">
                        {sale.receiptNumber}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded">
                        {sale.creditStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Customer</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {sale.customerName || 'N/A'}
                        </p>
                        {sale.customerPhone && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {sale.customerPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Sale Date</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {format(new Date(sale.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Total: </span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Paid: </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(sale.amountPaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Outstanding: </span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(sale.amountDue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSettle(sale)}
                      respectLicense
                    >
                      Settle
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedSale && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedSale(null);
          }}
          total={selectedSale.amountDue}
          onComplete={handleAddPayment}
          isSettlement={true}
        />
      )}
    </div>
  );
};
