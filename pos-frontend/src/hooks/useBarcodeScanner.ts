import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  timeThreshold?: number; // Max time between keystrokes in ms (scanners are fast)
}

export const useBarcodeScanner = ({
  onScan,
  minLength = 3,
  timeThreshold = 50,
}: UseBarcodeScannerOptions) => {
  // Use a ref to store the buffer so it doesn't trigger re-renders on every keypress
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeSinceLastKey = currentTime - lastKeyTimeRef.current;

      // If the time between keys is too long, reset the buffer (it's likely manual typing)
      // Exception: If the buffer is empty, this is the first key
      if (bufferRef.current.length > 0 && timeSinceLastKey > timeThreshold) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      // Handle Enter key (Scanner usually ends with Enter)
      if (e.key === 'Enter') {
        if (bufferRef.current.length >= minLength) {
           // Prevent default form submission if focused on inputs that might trigger it
           // But be careful not to block legit enter keys if buffer is empty
           // e.preventDefault(); // Optional: decide if we want to block Enter
           
           const scannedCode = bufferRef.current;
           bufferRef.current = ''; // Reset buffer immediately
           onScan(scannedCode);
        } else {
            // Buffer too short, probably just pressing Enter normally
            bufferRef.current = '';
        }
        return;
      }

      // Ignore special keys (Shift, Ctrl, etc.)
      if (e.key.length > 1) {
        return;
      }

      // Append printable characters to buffer
      bufferRef.current += e.key;
    };

    // Attach event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minLength, timeThreshold]);
};
