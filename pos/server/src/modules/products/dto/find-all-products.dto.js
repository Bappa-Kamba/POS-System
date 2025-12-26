"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllProductsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const TransformBoolean = () => (0, class_transformer_1.Transform)(({ value }) => {
    if (value === 'true' || value === true)
        return true;
    if (value === 'false' || value === false)
        return false;
    return undefined;
});
class FindAllProductsDto {
    skip = 0;
    take = 20;
    search;
    categoryId;
    isActive;
    hasVariants;
    lowStock;
    branchId;
}
exports.FindAllProductsDto = FindAllProductsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FindAllProductsDto.prototype, "skip", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FindAllProductsDto.prototype, "take", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindAllProductsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FindAllProductsDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'all' || value === null || value === '') {
            return 'ALL';
        }
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return undefined;
    }),
    (0, class_validator_1.ValidateIf)((o) => {
        return o.isActive !== undefined && o.isActive !== 'ALL';
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], FindAllProductsDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    TransformBoolean(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FindAllProductsDto.prototype, "hasVariants", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    TransformBoolean(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FindAllProductsDto.prototype, "lowStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindAllProductsDto.prototype, "branchId", void 0);
//# sourceMappingURL=find-all-products.dto.js.map