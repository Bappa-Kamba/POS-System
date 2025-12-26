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
exports.SalesReportDto = exports.ReportFrequency = exports.ReportGroupBy = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
var ReportGroupBy;
(function (ReportGroupBy) {
    ReportGroupBy["DAY"] = "day";
    ReportGroupBy["WEEK"] = "week";
    ReportGroupBy["MONTH"] = "month";
})(ReportGroupBy || (exports.ReportGroupBy = ReportGroupBy = {}));
var ReportFrequency;
(function (ReportFrequency) {
    ReportFrequency["DAILY"] = "daily";
    ReportFrequency["WEEKLY"] = "weekly";
    ReportFrequency["MONTHLY"] = "monthly";
    ReportFrequency["QUARTERLY"] = "quarterly";
    ReportFrequency["SEMI_ANNUAL"] = "semi-annual";
    ReportFrequency["YEARLY"] = "yearly";
})(ReportFrequency || (exports.ReportFrequency = ReportFrequency = {}));
class SalesReportDto {
    startDate;
    endDate;
    cashierId;
    category;
    groupBy;
    transactionType;
    sessionId;
    frequency;
}
exports.SalesReportDto = SalesReportDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "cashierId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportGroupBy),
    __metadata("design:type", String)
], SalesReportDto.prototype, "groupBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TransactionType),
    __metadata("design:type", String)
], SalesReportDto.prototype, "transactionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportFrequency),
    __metadata("design:type", String)
], SalesReportDto.prototype, "frequency", void 0);
//# sourceMappingURL=sales-report.dto.js.map