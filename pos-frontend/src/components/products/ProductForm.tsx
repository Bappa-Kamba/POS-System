import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Barcode } from 'lucide-react';
import type { Product } from '../../services/product.service';
import { useGenerateBarcode } from '../../hooks/useProducts';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  category: z.enum(['FROZEN', 'DRINKS', 'ACCESSORIES', 'OTHER']),
  hasVariants: z.boolean().optional(),
  costPrice: z.number().min(0, 'Cost price must be positive').optional(),
  sellingPrice: z.number().min(0, 'Selling price must be positive').optional(),
  quantityInStock: z.number().min(0, 'Stock must be positive').optional(),
  unitType: z.enum(['PIECE', 'WEIGHT', 'VOLUME']).optional(),
  lowStockThreshold: z.number().min(0, 'Threshold must be positive').optional(),
  taxable: z.boolean().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  branchId: z.string().min(1, 'Branch is required'),
}).refine(
  (data) => {
    if (!data.hasVariants && data.sellingPrice && data.costPrice) {
      return data.sellingPrice >= data.costPrice;
    }
    return true;
  },
  {
    message: 'Selling price must be greater than or equal to cost price',
    path: ['sellingPrice'],
  }
);

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  branchId?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  branchId,
}) => {
  const generateBarcode = useGenerateBarcode();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          sku: product.sku,
          barcode: product.barcode || '',
          category: product.category,
          hasVariants: product.hasVariants,
          costPrice: product.costPrice ?? undefined,
          sellingPrice: product.sellingPrice ?? undefined,
          quantityInStock: product.quantityInStock ?? undefined,
          unitType: product.unitType || 'PIECE',
          lowStockThreshold: product.lowStockThreshold ?? undefined,
          taxable: product.taxable,
          taxRate: product.taxRate ?? undefined,
          branchId: product.branchId,
        }
      : {
          hasVariants: false,
          taxable: true,
          unitType: 'PIECE',
          quantityInStock: 0,
          lowStockThreshold: 10,
          branchId: branchId || '',
        },
  });

  // Reset form when product changes
  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        hasVariants: product.hasVariants,
        costPrice: product.costPrice ?? undefined,
        sellingPrice: product.sellingPrice ?? undefined,
        quantityInStock: product.quantityInStock ?? undefined,
        unitType: product.unitType || 'PIECE',
        lowStockThreshold: product.lowStockThreshold ?? undefined,
        taxable: product.taxable,
        taxRate: product.taxRate ?? undefined,
        branchId: product.branchId,
      });
    } else {
      reset({
        hasVariants: false,
        taxable: true,
        unitType: 'PIECE',
        quantityInStock: 0,
        lowStockThreshold: 10,
        branchId: branchId || '',
      });
    }
  }, [product, branchId, reset]);

  const hasVariants = watch('hasVariants');

  const handleGenerateBarcode = async () => {
    try {
      const result = await generateBarcode.mutateAsync();
      if (result.success && result.data) {
        setValue('barcode', result.data.barcode);
      }
    } catch (error) {
      console.error('Failed to generate barcode:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Product Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Coca Cola 500ml"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Optional product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU *"
              {...register('sku')}
              error={errors.sku?.message}
              placeholder="e.g., DRINK-001"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Barcode
              </label>
              <div className="flex gap-2">
                <Input
                  {...register('barcode')}
                  error={errors.barcode?.message}
                  placeholder="Optional"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateBarcode}
                  isLoading={generateBarcode.isPending}
                  title="Generate Barcode"
                >
                  <Barcode className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="DRINKS">Drinks</option>
                <option value="FROZEN">Frozen</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('hasVariants')}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Has Variants
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing - Only show if no variants */}
      {!hasVariants && (
        <div>
          <h3 className="text-lg font-medium mb-4">Pricing</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cost Price *"
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
                error={errors.costPrice?.message}
                placeholder="0.00"
              />

              <Input
                label="Selling Price *"
                type="number"
                step="0.01"
                {...register('sellingPrice', { valueAsNumber: true })}
                error={errors.sellingPrice?.message}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('taxable')}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Taxable</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Inventory - Only show if no variants */}
      {!hasVariants && (
        <div>
          <h3 className="text-lg font-medium mb-4">Inventory</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Unit Type
                </label>
                <select
                  {...register('unitType')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="PIECE">Piece</option>
                  <option value="WEIGHT">Weight (kg)</option>
                  <option value="VOLUME">Volume (L)</option>
                </select>
              </div>

              <Input
                label="Quantity in Stock"
                type="number"
                step="0.01"
                {...register('quantityInStock', { valueAsNumber: true })}
                error={errors.quantityInStock?.message}
                placeholder="0"
              />

              <Input
                label="Low Stock Threshold"
                type="number"
                {...register('lowStockThreshold', { valueAsNumber: true })}
                error={errors.lowStockThreshold?.message}
                placeholder="10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden field for branchId */}
      <input type="hidden" {...register('branchId')} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
