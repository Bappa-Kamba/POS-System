import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AssetsService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly dataDir;
    private readonly assetsDir;
    private readonly RECEIPT_PAPER_MM;
    private readonly RECEIPT_PADDING_MM;
    private readonly RECEIPT_DPI;
    private readonly RECEIPT_LOGO_THRESHOLD;
    private readonly contentWidthPx;
    constructor(prisma: PrismaService, config: ConfigService);
    uploadReceiptLogo(file: Express.Multer.File, scope: 'BRANCH' | 'SUBDIVISION', scopeId: string): Promise<{
        assetId: string;
        processedUrl: string;
    }>;
    private processLogo;
    getProcessedFilePath(assetId: string): Promise<string>;
}
