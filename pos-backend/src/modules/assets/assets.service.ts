import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
// import { AssetKind } from '@prisma/client';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly dataDir: string;
  private readonly assetsDir: string;

  // Defaults
  private readonly RECEIPT_PAPER_MM = 80;
  private readonly RECEIPT_PADDING_MM = 4;
  private readonly RECEIPT_DPI = 600;
  private readonly RECEIPT_LOGO_THRESHOLD = 155;
  
  private readonly contentWidthPx: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // Config
    const dataDirEnv = this.config.get<string>('DATA_DIR');
    // If DATA_DIR is not set, use a 'data' folder in the project root
    this.dataDir = dataDirEnv ? path.resolve(dataDirEnv) : path.join(process.cwd(), 'data');
    this.assetsDir = path.join(this.dataDir, 'assets', 'logos');

    const paperMm = this.config.get<number>('RECEIPT_PAPER_MM') || this.RECEIPT_PAPER_MM;
    const paddingMm = this.config.get<number>('RECEIPT_PADDING_MM') || this.RECEIPT_PADDING_MM;
    const dpi = this.config.get<number>('RECEIPT_DPI') || this.RECEIPT_DPI;
    
    // Computation: paperWidthPx = round(RECEIPT_PAPER_MM / 25.4 * RECEIPT_DPI)
    const paperWidthPx = Math.round(paperMm / 25.4 * dpi);
    const paddingPx = Math.round(paddingMm / 25.4 * dpi);
    this.contentWidthPx = paperWidthPx - (2 * paddingPx);

    // Initial log
    this.logger.log(`AssetsService init: dataDir=${this.dataDir}, contentWidthPx=${this.contentWidthPx}`);
    
    // Ensure dirs
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  async uploadReceiptLogo(file: Express.Multer.File, scope: 'BRANCH' | 'SUBDIVISION', scopeId: string) {
    if (!file) {
        throw new BadRequestException('No file provided');
    }

    const validateMime = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validateMime.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only SVG, PNG, JPEG allowed');
    }

    const logoId = randomUUID();
    const logoDir = path.join(this.assetsDir, logoId);
    if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

    // Use originalname to get extension, careful of security but we store strictly in logoDir with limited access through API
    const ext = path.extname(file.originalname) || '.dat';
    const originalFilename = `original${ext}`;
    const originalPath = path.join(logoDir, originalFilename);
    const processedPath = path.join(logoDir, 'processed.png');

    // 1. Save original
    fs.writeFileSync(originalPath, file.buffer);

    // 2. Process
    try {
        await this.processLogo(file.buffer, processedPath);
    } catch (error: any) {
        this.logger.error(`Logo processing failed: ${error.message}`, error.stack);
        // Cleanup
        fs.rmSync(logoDir, { recursive: true, force: true });
        throw new BadRequestException('Failed to process image: ' + error.message);
    }

    this.logger.log(`Logo processed successfully: ${processedPath}`);

    // 3. Create DB Asset
    const asset = await this.prisma.asset.create({
        data: {
            id: logoId,
            kind: 'RECEIPT_LOGO', // Ensure explicitly matching enum string if enum import fails
            mimeType: file.mimetype,
            originalPath: originalPath,
            processedPath: processedPath,
            fileSizeBytes: file.size,
        }
    });

    // 4. Attach to Scope
    if (scope === 'BRANCH') {
        await this.prisma.branch.update({
            where: { id: scopeId },
            data: { receiptLogoAssetId: asset.id } as any
        });
    } else if (scope === 'SUBDIVISION') {
        await this.prisma.subdivision.update({
            where: { id: scopeId },
            data: { receiptLogoAssetId: asset.id } as any
        });
    }

    return {
        assetId: asset.id,
        processedUrl: `/api/v1/assets/${asset.id}/processed` 
    };
  }

  private async processLogo(inputBuffer: Buffer, outputPath: string) {
      const thresholdReq = this.config.get<number>('RECEIPT_LOGO_THRESHOLD') || this.RECEIPT_LOGO_THRESHOLD;
      
      const pipeline = sharp(inputBuffer);
      
      // 1. rotate
      pipeline.rotate();
      
      // 2. resize
      pipeline.resize({ width: this.contentWidthPx, withoutEnlargement: false });
      
      // 3. flatten (background white)
      pipeline.flatten({ background: '#ffffff' });
      
      // 4. grayscale
      pipeline.grayscale();
      
      // 5. sharpen
      pipeline.sharpen();
      
      // 6. threshold
      pipeline.threshold(thresholdReq);
      
      // 7. output png
      await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
  }

  async getProcessedFilePath(assetId: string): Promise<string> {
      const asset = await (this.prisma as any).asset.findUnique({ where: { id: assetId } });
      if (!asset || !asset.processedPath) throw new NotFoundException('Asset not found');
      
      // Security check: ensure path is within assetsDir
      if (!asset.processedPath.startsWith(this.assetsDir)) {
          throw new NotFoundException('Invalid asset path');
      }
      
      if (!fs.existsSync(asset.processedPath)) {
          throw new NotFoundException('File on disk not found');
      }

      return asset.processedPath;
  }
}
