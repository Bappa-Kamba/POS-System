import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { Printer, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface BarcodePrintProps {
  barcode: string;
  productName?: string;
  sku?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodePrint: React.FC<BarcodePrintProps> = ({
  barcode,
  productName,
  sku,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Barcode - ${productName || sku || barcode}`,
    pageStyle: `
      @page {
        size: 3in 2in;
        margin: 0.25in;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  if (!barcode) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Barcode" size="md">
      <div className="space-y-6">
        {/* Printable Content - Used for printing */}
        <div
          ref={printRef}
          className="flex flex-col items-center justify-center gap-4 p-6"
          style={{
            minHeight: '2in',
            width: '3in',
            fontFamily: 'Arial, sans-serif',
            margin: '0 auto',
          }}
        >
          {productName && (
            <div className="text-center">
              <div
                className="font-semibold text-primary-900 dark:text-primary-100"
                style={{ fontSize: '14px', marginBottom: '5px' }}
              >
                {productName}
              </div>
              {sku && (
                <div className="text-primary-900 dark:text-primary-100">
                  SKU: {sku}
                </div>
              )}
            </div>
          )}
          <div className="bg-white p-4 rounded">
            <Barcode
              value={barcode}
              format="EAN13"
              width={2}
              height={80}
              displayValue={true}
              fontSize={14}
              margin={10}
            />
          </div>
          <div
            className="font-mono text-primary-900 dark:text-primary-100"
            style={{ fontSize: '12px', marginTop: '5px' }}
          >
            {barcode}
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <p className="text-sm text-primary-900 dark:text-primary-100">
            <strong>Print Instructions:</strong>
          </p>
          <ul className="text-xs text-primary-800 dark:text-primary-200 mt-2 space-y-1 list-disc list-inside">
            <li>Click "Print Barcode" to open print dialog</li>
            <li>Select your label printer or regular printer</li>
            <li>Recommended label size: 3" x 2" (76mm x 51mm)</li>
            <li>Ensure barcode is clear and scannable</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 no-print">
          <Button variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Barcode
          </Button>
        </div>
      </div>
    </Modal>
  );
};

