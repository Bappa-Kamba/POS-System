import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';

interface ReceiptLogoUploadProps {
  label?: string;
  scope: 'BRANCH' | 'SUBDIVISION';
  scopeId: string;
  currentLogoAssetId?: string | null;
  onUploadSuccess?: (assetId: string) => void;
}

export const ReceiptLogoUpload: React.FC<ReceiptLogoUploadProps> = ({
  label = 'Receipt Logo',
  scope,
  scopeId,
  currentLogoAssetId,
  onUploadSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const resolveUrl = (assetId: string) => {
        const path = `/api/v1/assets/${assetId}/processed`;
        const backendBase = localStorage.getItem('pos_backend') || '/api/v1';
        if (backendBase.startsWith('http')) {
             try {
                 const origin = new URL(backendBase).origin;
                 return `${origin}${path}`;
             } catch (e) {
                 return path;
             }
        }
        return path;
    };

    if (currentLogoAssetId) {
        setPreviewUrl(resolveUrl(currentLogoAssetId));
    } else {
        setPreviewUrl(null);
    }
  }, [currentLogoAssetId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setError('Invalid file type. Please upload SVG, PNG, or JPEG.');
        return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', scope);
    formData.append('scopeId', scopeId);

    try {
      const response = await api.post('/assets/receipt-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { assetId, processedUrl } = response.data;
      
      const backendBase = localStorage.getItem('pos_backend') || '/api/v1';
      let finalUrl = processedUrl;
      if (backendBase.startsWith('http')) {
          try {
             // If processedUrl starts with /, append to origin
             const origin = new URL(backendBase).origin;
             finalUrl = `${origin}${processedUrl}`;
          } catch(e) {}
      }

      setPreviewUrl(finalUrl);
      
      if (onUploadSuccess) onUploadSuccess(assetId);
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      
      <div className="flex items-start gap-6">
        {/* Preview Area */}
        <div className="relative w-32 h-32 bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Receipt Logo" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-2">
                <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 mb-1" />
                <span className="text-xs text-neutral-500">No Logo</span>
            </div>
          )}
          {isUploading && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <Loader2 className="w-6 h-6 text-white animate-spin" />
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload a logo to appear on receipts. <br/>
            Supported formats: SVG (best), PNG, JPEG. <br/>
            Will be automatically processed to black & white 80mm format.
          </p>
          
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".svg,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
