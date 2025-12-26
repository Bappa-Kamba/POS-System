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
exports.ExportReportDto = exports.ExportFormat = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
var ReportType;
(function (ReportType) {
    ReportType["SALES"] = "sales";
    ReportType["PROFIT_LOSS"] = "profit-loss";
    ReportType["INVENTORY"] = "inventory";
    ReportType["EXPENSES"] = "expenses";
    ReportType["CASHBACK"] = "cashback";
    ReportType["SESSION"] = "session";
})(ReportType || (exports.ReportType = ReportType = {}));
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["PDF"] = "pdf";
    ExportFormat["EXCEL"] = "excel";
    ExportFormat["CSV"] = "csv";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
const sales_report_dto_1 = require("./sales-report.dto");
class ExportReportDto {
    reportType;
    format;
    startDate;
    endDate;
    frequency;
    filters;
}
exports.ExportReportDto = ExportReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], ExportReportDto.prototype, "reportType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ExportFormat),
    __metadata("design:type", String)
], ExportReportDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportReportDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportReportDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(sales_report_dto_1.ReportFrequency),
    __metadata("design:type", String)
], ExportReportDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExportReportDto.prototype, "filters", void 0);
//# sourceMappingURL=export-report.dto.js.map