export declare enum SubdivisionStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ARCHIVED = "ARCHIVED"
}
export declare function getStatusLabel(status: SubdivisionStatus): string;
export declare function getStatusColor(status: SubdivisionStatus): string;
