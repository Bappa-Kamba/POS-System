/**
 * Subdivision Status Enum
 * Defines the operational status of a subdivision
 */
export enum SubdivisionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Get human-readable label for a status
 */
export function getStatusLabel(status: SubdivisionStatus): string {
  const labels: Record<SubdivisionStatus, string> = {
    [SubdivisionStatus.ACTIVE]: 'Active',
    [SubdivisionStatus.INACTIVE]: 'Inactive',
    [SubdivisionStatus.ARCHIVED]: 'Archived',
  };
  return labels[status];
}

/**
 * Get color for status badge
 */
export function getStatusColor(status: SubdivisionStatus): string {
  const colors: Record<SubdivisionStatus, string> = {
    [SubdivisionStatus.ACTIVE]: 'green',
    [SubdivisionStatus.INACTIVE]: 'yellow',
    [SubdivisionStatus.ARCHIVED]: 'gray',
  };
  return colors[status];
}
