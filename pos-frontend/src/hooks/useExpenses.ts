import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type CreateExpenseData, type UpdateExpenseData, type FindAllExpensesParams } from '../services/expense.service';

export const useExpenses = (params?: FindAllExpensesParams) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseService.getAll(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => expenseService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create expense:', error);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      expenseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
    },
    onError: (error: Error) => {
      console.error('Failed to update expense:', error);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete expense:', error);
    },
  });
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

