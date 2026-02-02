import { Controller, Post, UseInterceptors, UploadedFile, Body, Res, Get, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import type { Response } from 'express';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('receipt-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceiptLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body('scope') scope: 'BRANCH' | 'SUBDIVISION',
    @Body('scopeId') scopeId: string,
  ) {
    if (!scope || !scopeId) {
        throw new BadRequestException('Scope and ScopeID are required');
    }
    return this.assetsService.uploadReceiptLogo(file, scope, scopeId);
  }

  @Get(':id/processed')
  async getProcessedLogo(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.assetsService.getProcessedFilePath(id);
    res.setHeader('Content-Type', 'image/png');
    // Cache control? Maybe useful.
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
  }
}
