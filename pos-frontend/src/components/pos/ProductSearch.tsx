import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../common/Input';
import { BarcodeScanner } from '../products/BarcodeScanner';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onProductFound?: (product: Product | Variant, type: 'product' | 'variant') => void;
  searchQuery: string;
  placeholder?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onProductFound,
  searchQuery,
  placeholder = 'Search by name, SKU, or barcode...',
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard shortcut: Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onSearch(localQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuery, onSearch]);

  // Sync with external searchQuery
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleBarcodeFound = (product: Product | Variant, type: 'product' | 'variant') => {
    if (onProductFound) {
      onProductFound(product, type);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
        <Input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>
      <BarcodeScanner
        onProductFound={handleBarcodeFound}
      />
    </div>
  );
};

