import { AssetsService } from './assets.service';
import type { Response } from 'express';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    uploadReceiptLogo(file: Express.Multer.File, scope: 'BRANCH' | 'SUBDIVISION', scopeId: string): Promise<{
        assetId: string;
        processedUrl: string;
    }>;
    getProcessedLogo(id: string, res: Response): Promise<void>;
}
