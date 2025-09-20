import { OcrExtractionResult, VisionExtractionResult } from '@xr/shared';
import { ClassicalOcrAdapter } from '../adapters/classicalOcrAdapter';
import { OpenAiVisionAdapter } from '../adapters/openaiAdapter';
import { applicationLogger } from '../logger';

export interface OcrOrchestratorResult {
  classicalOcr: OcrExtractionResult;
  vision: VisionExtractionResult;
}

export class OcrOrchestratorService {
  constructor(
    private readonly classicalOcrAdapter: ClassicalOcrAdapter,
    private readonly openAiVisionAdapter: OpenAiVisionAdapter
  ) {}

  async processImageBuffer(requestBuffer: Buffer, mimeType: string, originalFileName: string): Promise<OcrOrchestratorResult> {
    applicationLogger.info({ originalFileName, mimeType }, 'Starting OCR orchestration');

    const classicalOcrResult = await this.classicalOcrAdapter.extractTextFromImage({
      imageBuffer: requestBuffer,
      mimeType,
      originalFileName
    });

    const textLines = classicalOcrResult.lines.map((line) => line.text);

    const visionResult = await this.openAiVisionAdapter.extractStructuredRecipe({
      ocrTextLines: textLines
    });

    applicationLogger.info({ originalFileName }, 'Completed OCR orchestration');

    return {
      classicalOcr: classicalOcrResult,
      vision: visionResult
    };
  }
}
