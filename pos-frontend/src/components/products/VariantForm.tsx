import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Barcode } from 'lucide-react';
import type { Variant } from '../../services/variant.service';
import { useCreateVariant, useUpdateVariant } from '../../hooks/useVariants';
import { useGenerateBarcode } from '../../hooks/useProducts';

const createVariantSchema = (productSku: string) => z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string()
    .min(1, 'SKU is required')
    .refine(
      (sku) => sku.startsWith(`${productSku}-`),
      {
        message: `SKU must start with "${productSku}-"`,
      }
    ),
  barcode: z.string().optional(),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  quantityInStock: z.number().min(0, 'Stock must be positive'),
  lowStockThreshold: z.number().min(0, 'Threshold must be positive').optional(),
  attributes: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
}).refine(
  (data) => data.sellingPrice >= data.costPrice,
  {
    message: 'Selling price must be greater than or equal to cost price',
    path: ['sellingPrice'],
  }
);

type VariantFormValues = z.infer<ReturnType<typeof createVariantSchema>>;

interface VariantFormProps {
  productId: string;
  productSku: string;
  variant?: Variant;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  productId,
  productSku,
  variant,
  onSuccess,
  onCancel,
}) => {
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const generateBarcode = useGenerateBarcode();

  const variantSchema = React.useMemo(() => createVariantSchema(productSku), [productSku]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant
      ? {
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode || undefined,
          costPrice: variant.costPrice,
          sellingPrice: variant.sellingPrice,
          quantityInStock: variant.quantityInStock,
          lowStockThreshold: variant.lowStockThreshold,
          attributes: variant.attributes || undefined,
          expiryDate: variant.expiryDate
            ? new Date(variant.expiryDate).toISOString().split('T')[0]
            : undefined,
        }
      : {
          quantityInStock: 1,
          lowStockThreshold: 10,
        },
  });

  const costPrice = watch('costPrice');
  const sellingPrice = watch('sellingPrice');

  const profitMargin =
    costPrice && sellingPrice && costPrice > 0
      ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2)
      : '0.00';

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

  const onSubmit = async (data: VariantFormValues) => {
    try {
      // Transform empty strings to undefined for optional fields
      const payload = {
        ...data,
        expiryDate: data.expiryDate && data.expiryDate.trim() !== '' ? data.expiryDate : undefined,
      };

      if (variant) {
        await updateVariant.mutateAsync({
          productId,
          variantId: variant.id,
          data: payload,
        });
      } else {
        await createVariant.mutateAsync({
          productId,
          data: payload,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save variant:', error);
      alert('Failed to save variant');
    }
  };

  const isLoading = createVariant.isPending || updateVariant.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Variant Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Small - Black, 500g"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                SKU * <span className="text-xs text-neutral-500">(must start with {productSku}-)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  {...register('sku')}
                  error={errors.sku?.message}
                  placeholder={`${productSku}-S-BLK`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const suggestedSku = `${productSku}-${Date.now().toString().slice(-4)}`;
                    setValue('sku', suggestedSku);
                  }}
                  title="Auto-generate SKU"
                >
                  Auto
                </Button>
              </div>
            </div>

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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Attributes (JSON)
            </label>
            <textarea
              {...register('attributes')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder='{"size": "M", "color": "Blue"}'
            />
            {errors.attributes && (
              <p className="mt-1 text-sm text-red-600">{errors.attributes.message}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Enter attributes as JSON format
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
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

          {costPrice && sellingPrice && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
              <p className="text-sm text-primary-900 dark:text-primary-100">
                Profit Margin: <span className="font-semibold">{profitMargin}%</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h3 className="text-lg font-medium mb-4">Inventory</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity in Stock *"
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Expiry Date <span className="text-xs text-neutral-400">(Optional)</span>
            </label>
            <Input
              type="date"
              {...register('expiryDate')}
              error={errors.expiryDate?.message}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave empty for products without expiry dates
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {variant ? 'Update Variant' : 'Create Variant'}
        </Button>
      </div>
    </form>
  );
};

