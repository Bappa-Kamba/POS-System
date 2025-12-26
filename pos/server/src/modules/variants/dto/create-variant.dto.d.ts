export declare class CreateVariantDto {
    name: string;
    sku: string;
    barcode?: string;
    costPrice: number;
    sellingPrice: number;
    quantityInStock: number;
    lowStockThreshold?: number;
    attributes?: string;
    expiryDate?: string;
}
