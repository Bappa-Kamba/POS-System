import { SubdivisionStatus } from '@prisma/client';
import { CreateSubdivisionDto } from './create-subdivision.dto';
declare const UpdateSubdivisionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSubdivisionDto>>;
export declare class UpdateSubdivisionDto extends UpdateSubdivisionDto_base {
    status?: SubdivisionStatus;
}
export {};
