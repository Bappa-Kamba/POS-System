import React, { useState, useRef, useEffect } from 'react';
import { Scan, X, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { useFindByBarcode } from '../../hooks/useProducts';

interface BarcodeScannerProps {
  onProductFound?: (product: any, type: 'product' | 'variant') => void;
  onClose?: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const findByBarcode = useFindByBarcode();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleBarcodeInput = async (value: string) => {
    setBarcodeInput(value);

    // Auto-search when barcode is complete (EAN-13 is 13 digits)
    if (value.length === 13 && /^\d+$/.test(value)) {
      await searchBarcode(value);
    }
  };

  const searchBarcode = async (barcode?: string) => {
    const code = barcode || barcodeInput.trim();
    if (!code) return;

    try {
      setIsScanning(true);
      const result = await findByBarcode.mutateAsync(code);

      if (result.success && result.data) {
        if (onProductFound) {
          onProductFound(result.data.data, result.data.type);
        }
        setIsOpen(false);
        setBarcodeInput('');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: any } };
        if (axiosError.response?.status === 404) {
          alert('Product or variant with this barcode not found');
        } else {
          console.error('Barcode search failed:', error);
          alert('Failed to search barcode');
        }
      } else {
        console.error('Barcode search failed:', error);
        alert('Failed to search barcode');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBarcode();
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        title="Scan Barcode"
      >
        <Scan className="w-4 h-4 mr-2" />
        Scan Barcode
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setBarcodeInput('');
          if (onClose) onClose();
        }}
        title="Barcode Scanner"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Enter or Scan Barcode
            </label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => handleBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan barcode or type 13-digit code"
                className="flex-1 font-mono text-lg"
                maxLength={13}
                disabled={isScanning}
              />
              <Button
                onClick={() => searchBarcode()}
                isLoading={isScanning}
                disabled={!barcodeInput.trim()}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Enter a 13-digit EAN-13 barcode or scan with a barcode scanner
            </p>
          </div>

          {findByBarcode.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {findByBarcode.error &&
                typeof findByBarcode.error === 'object' &&
                'response' in findByBarcode.error
                  ? (findByBarcode.error as { response?: { data?: { error?: { message?: string } } } })
                      .response?.data?.error?.message || 'Failed to find product with this barcode'
                  : 'Failed to find product with this barcode'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                setBarcodeInput('');
                if (onClose) onClose();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

