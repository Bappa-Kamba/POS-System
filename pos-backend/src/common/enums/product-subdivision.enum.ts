/**
 * Product Subdivision Enum
 * Defines the main business subdivisions for product categorization
 */
export enum ProductSubdivision {
  CASHBACK_ACCESSORIES = 'CASHBACK_ACCESSORIES',
  FROZEN_DRINKS = 'FROZEN_DRINKS',
}

/**
 * Get human-readable label for a subdivision
 */
export function getSubdivisionLabel(subdivision: ProductSubdivision): string {
  const labels: Record<ProductSubdivision, string> = {
    [ProductSubdivision.CASHBACK_ACCESSORIES]: 'Cashback & Accessories',
    [ProductSubdivision.FROZEN_DRINKS]: 'Frozen Products & Drinks',
  };
  return labels[subdivision];
}

/**
 * Get description for a subdivision
 */
export function getSubdivisionDescription(
  subdivision: ProductSubdivision,
): string {
  const descriptions: Record<ProductSubdivision, string> = {
    [ProductSubdivision.CASHBACK_ACCESSORIES]:
      'Mobile accessories, phone cases, chargers, and cashback services',
    [ProductSubdivision.FROZEN_DRINKS]:
      'Frozen foods, beverages, ice cream, and cold drinks',
  };
  return descriptions[subdivision];
}

/**
 * Get all subdivisions with metadata
 */
export function getAllSubdivisions() {
  return Object.values(ProductSubdivision).map((subdivision) => ({
    value: subdivision,
    label: getSubdivisionLabel(subdivision),
    description: getSubdivisionDescription(subdivision),
  }));
}
