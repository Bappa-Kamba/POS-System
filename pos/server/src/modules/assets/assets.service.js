"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const sharp_1 = __importDefault(require("sharp"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
let AssetsService = AssetsService_1 = class AssetsService {
    prisma;
    config;
    logger = new common_1.Logger(AssetsService_1.name);
    dataDir;
    assetsDir;
    RECEIPT_PAPER_MM = 80;
    RECEIPT_PADDING_MM = 4;
    RECEIPT_DPI = 600;
    RECEIPT_LOGO_THRESHOLD = 155;
    contentWidthPx;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const dataDirEnv = this.config.get('DATA_DIR');
        this.dataDir = dataDirEnv ? path.resolve(dataDirEnv) : path.join(process.cwd(), 'data');
        this.assetsDir = path.join(this.dataDir, 'assets', 'logos');
        const paperMm = this.config.get('RECEIPT_PAPER_MM') || this.RECEIPT_PAPER_MM;
        const paddingMm = this.config.get('RECEIPT_PADDING_MM') || this.RECEIPT_PADDING_MM;
        const dpi = this.config.get('RECEIPT_DPI') || this.RECEIPT_DPI;
        const paperWidthPx = Math.round(paperMm / 25.4 * dpi);
        const paddingPx = Math.round(paddingMm / 25.4 * dpi);
        this.contentWidthPx = paperWidthPx - (2 * paddingPx);
        this.logger.log(`AssetsService init: dataDir=${this.dataDir}, contentWidthPx=${this.contentWidthPx}`);
        if (!fs.existsSync(this.assetsDir)) {
            fs.mkdirSync(this.assetsDir, { recursive: true });
        }
    }
    async uploadReceiptLogo(file, scope, scopeId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const validateMime = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!validateMime.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only SVG, PNG, JPEG allowed');
        }
        const logoId = (0, crypto_1.randomUUID)();
        const logoDir = path.join(this.assetsDir, logoId);
        if (!fs.existsSync(logoDir))
            fs.mkdirSync(logoDir, { recursive: true });
        const ext = path.extname(file.originalname) || '.dat';
        const originalFilename = `original${ext}`;
        const originalPath = path.join(logoDir, originalFilename);
        const processedPath = path.join(logoDir, 'processed.png');
        fs.writeFileSync(originalPath, file.buffer);
        try {
            await this.processLogo(file.buffer, processedPath);
        }
        catch (error) {
            this.logger.error(`Logo processing failed: ${error.message}`, error.stack);
            fs.rmSync(logoDir, { recursive: true, force: true });
            throw new common_1.BadRequestException('Failed to process image: ' + error.message);
        }
        this.logger.log(`Logo processed successfully: ${processedPath}`);
        const asset = await this.prisma.asset.create({
            data: {
                id: logoId,
                kind: 'RECEIPT_LOGO',
                mimeType: file.mimetype,
                originalPath: originalPath,
                processedPath: processedPath,
                fileSizeBytes: file.size,
            }
        });
        if (scope === 'BRANCH') {
            await this.prisma.branch.update({
                where: { id: scopeId },
                data: { receiptLogoAssetId: asset.id }
            });
        }
        else if (scope === 'SUBDIVISION') {
            await this.prisma.subdivision.update({
                where: { id: scopeId },
                data: { receiptLogoAssetId: asset.id }
            });
        }
        return {
            assetId: asset.id,
            processedUrl: `/api/v1/assets/${asset.id}/processed`
        };
    }
    async processLogo(inputBuffer, outputPath) {
        const thresholdReq = this.config.get('RECEIPT_LOGO_THRESHOLD') || this.RECEIPT_LOGO_THRESHOLD;
        const pipeline = (0, sharp_1.default)(inputBuffer);
        pipeline.rotate();
        pipeline.resize({ width: this.contentWidthPx, withoutEnlargement: false });
        pipeline.flatten({ background: '#ffffff' });
        pipeline.grayscale();
        pipeline.sharpen();
        pipeline.threshold(thresholdReq);
        await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
    }
    async getProcessedFilePath(assetId) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset || !asset.processedPath)
            throw new common_1.NotFoundException('Asset not found');
        if (!asset.processedPath.startsWith(this.assetsDir)) {
            throw new common_1.NotFoundException('Invalid asset path');
        }
        if (!fs.existsSync(asset.processedPath)) {
            throw new common_1.NotFoundException('File on disk not found');
        }
        return asset.processedPath;
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map