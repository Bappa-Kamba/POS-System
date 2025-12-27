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
    pageStyle:`
      @page {
        size: 80mm auto;
        margin: 0;
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
          className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-md bg-white mx-auto"
          style={{
            minHeight: 'auto',
            width: '80mm',
            fontFamily: 'Arial, sans-serif',
            // Interactive preview styles (not print)
            transform: 'scale(1)',
            transformOrigin: 'top center',
          }}
        >
          {productName && (
            <div className="text-center w-full">
              <div
                className="font-bold text-black"
                style={{ fontSize: '12px', marginBottom: '2px', lineHeight: '1.2' }}
              >
                {productName.substring(0, 30)}
              </div>
              {sku && (
                <div className="text-black mb-1" style={{ fontSize: '12px' }}>
                  SKU: {sku}
                </div>
              )}
            </div>
          )}
          <div className="bg-white p-1">
            <Barcode
              value={barcode}
              format="EAN13"
              width={2}
              height={50}
              displayValue={true}
              fontSize={12}
              margin={5}
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 no-print">
          <p className="text-sm text-primary-900 dark:text-primary-100">
            <strong>Print Instructions:</strong>
          </p>
          <ul className="text-xs text-primary-800 dark:text-primary-200 mt-2 space-y-1 list-disc list-inside">
            <li>Click "Print Barcode" to open print dialog</li>
            <li>Printer settings: <strong>80mm Receipt (No Margins)</strong></li>
            <li>Scale: 100% (Do not fit to page)</li>
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
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};

