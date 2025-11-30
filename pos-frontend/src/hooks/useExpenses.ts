import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  expenseService,
  type CreateExpenseData,
  type UpdateExpenseData,
  type FindAllExpensesParams,
  type CreateExpenseCategoryData,
  type UpdateExpenseCategoryData,
} from "../services/expense.service";

export const useExpenses = (params?: FindAllExpensesParams) => {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expenseService.getAll(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => expenseService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.create(data),
    onSuccess: () => {
      // Invalidate and refetch all expense queries
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      // Force refetch to ensure latest data
      queryClient.refetchQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create expense:", error);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      expenseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", variables.id] });
      // Force refetch to ensure latest data
      queryClient.refetchQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update expense:", error);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      // Force refetch to ensure latest data
      queryClient.refetchQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete expense:", error);
    },
  });
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

// Category Management Hooks
export const useAllExpenseCategories = () => {
  return useQuery({
    queryKey: ["expense-categories-all"],
    queryFn: () => expenseService.getAllCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpenseCategory = (id: string) => {
  return useQuery({
    queryKey: ["expense-category", id],
    queryFn: () => expenseService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseCategoryData) =>
      expenseService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      queryClient.invalidateQueries({ queryKey: ["expense-categories-all"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create expense category:", error);
    },
  });
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExpenseCategoryData;
    }) => expenseService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      queryClient.invalidateQueries({ queryKey: ["expense-categories-all"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-category", variables.id],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to update expense category:", error);
    },
  });
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      queryClient.invalidateQueries({ queryKey: ["expense-categories-all"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete expense category:", error);
    },
  });
};
