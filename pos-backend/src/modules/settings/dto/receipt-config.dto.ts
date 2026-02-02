/**
 * Receipt Configuration DTO
 * Represents a fully resolved receipt configuration
 * with all values populated (no nulls)
 */
export interface ResolvedReceiptConfig {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  receiptFooter: string;
  branchName: string;
  currency: string;
  logoAssetId?: string;
}


