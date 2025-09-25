import { OcrExtractionResult } from '@xr/shared';
import { ClassicalOcrAdapter } from '../adapters/classicalOcrAdapter';
import { applicationLogger } from '../logger';

export class OcrOrchestratorService {
  constructor(private readonly classicalOcrAdapter: ClassicalOcrAdapter) {}

  async processImageBuffer(requestBuffer: Buffer, mimeType: string, originalFileName: string): Promise<OcrExtractionResult> {
    applicationLogger.info({ originalFileName, mimeType }, 'Starting classical OCR extraction');

    const classicalOcrResult = await this.classicalOcrAdapter.extractTextFromImage({
      imageBuffer: requestBuffer,
      mimeType,
      originalFileName
    });

    applicationLogger.info({ originalFileName, provider: classicalOcrResult.providerName }, 'Completed classical OCR extraction');

    return classicalOcrResult;
  }
}
