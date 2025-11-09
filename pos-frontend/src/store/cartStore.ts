import { create } from "zustand";
import type { Product } from "../services/product.service";
import type { Variant } from "../services/variant.service";

export interface CartItem {
  id: string; // Unique ID for this cart item
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  taxable: boolean;
  taxRate: number;
  unitType?: "PIECE" | "WEIGHT" | "VOLUME";
  availableStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    variant?: Variant | null,
    quantity?: number
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, variant, quantity = 1) => {
    const { items } = get();

    // If product has variants, variant must be provided
    if (product.hasVariants && !variant) {
      console.warn("Product has variants but no variant provided");
      return;
    }

    // If product doesn't have variants, use product pricing
    if (!product.hasVariants) {
      // Check if item already exists in cart
      const existingItem = items.find(
        (item) => item.productId === product.id && !item.variantId
      );

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const maxQuantity = product.quantityInStock || 0;

        if (newQuantity > maxQuantity) {
          alert(`Only ${maxQuantity} units available in stock`);
          return;
        }

        set({
          items: items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        });
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `product-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.sellingPrice || 0,
          costPrice: product.costPrice || 0,
          quantity,
          taxable: product.taxable,
          taxRate: product.taxRate || 0,
          unitType: product.unitType,
          availableStock: product.quantityInStock || 0,
        };

        if (newItem.quantity > newItem.availableStock) {
          alert(`Only ${newItem.availableStock} units available in stock`);
          return;
        }

        set({ items: [...items, newItem] });
      }
    } else {
      // Product has variants - use variant pricing
      if (!variant) return;

      // Check if variant already exists in cart
      const existingItem = items.find((item) => item.variantId === variant.id);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const maxQuantity = variant.quantityInStock;

        if (newQuantity > maxQuantity) {
          alert(`Only ${maxQuantity} units available in stock`);
          return;
        }

        set({
          items: items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        });
      } else {
        // Add new variant item
        const newItem: CartItem = {
          id: `variant-${variant.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku,
          unitPrice: variant.sellingPrice,
          costPrice: variant.costPrice,
          quantity,
          taxable: product.taxable,
          taxRate: product.taxRate || 0,
          unitType: "PIECE", // Variants are always piece-based
          availableStock: variant.quantityInStock,
        };

        if (newItem.quantity > newItem.availableStock) {
          alert(`Only ${newItem.availableStock} units available in stock`);
          return;
        }

        set({ items: [...items, newItem] });
      }
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((item) => item.id !== itemId) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    const { items } = get();
    const item = items.find((i) => i.id === itemId);

    if (!item) return;

    if (quantity > item.availableStock) {
      alert(`Only ${item.availableStock} units available in stock`);
      return;
    }

    set({
      items: items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  },

  getTaxAmount: () => {
    return get().items.reduce((sum, item) => {
      if (!item.taxable) return sum;
      const itemSubtotal = item.unitPrice * item.quantity;
      return sum + itemSubtotal * item.taxRate;
    }, 0);
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTaxAmount();
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
