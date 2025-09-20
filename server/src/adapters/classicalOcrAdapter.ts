import { OcrExtractionResult } from '@xr/shared';
import { applicationConfiguration, ClassicalOcrProvider } from '../config/env';
import { applicationLogger } from '../logger';

export interface ClassicalOcrRequest {
  imageBuffer: Buffer;
  mimeType: string;
  originalFileName: string;
}

export class ClassicalOcrAdapter {
  private readonly providerName: ClassicalOcrProvider = applicationConfiguration.classicalOcr.providerName;
  private readonly azureEndpoint = applicationConfiguration.classicalOcr.azureEndpoint;
  private readonly azureKey = applicationConfiguration.classicalOcr.azureKey;
  private readonly googleProjectId = applicationConfiguration.classicalOcr.googleProjectId;
  private readonly googleCredentialsPath = applicationConfiguration.classicalOcr.googleCredentialsPath;

  async extractTextFromImage(requestPayload: ClassicalOcrRequest): Promise<OcrExtractionResult> {
    console.log('[Classical OCR Placeholder] Preparing to process image', {
      providerName: this.providerName,
      mimeType: requestPayload.mimeType,
      fileName: requestPayload.originalFileName
    });

    if (this.providerName === 'none') {
      applicationLogger.info(
        { fileName: requestPayload.originalFileName },
        'Skipping classical OCR - provider disabled'
      );
      console.log('[Classical OCR Placeholder] Provider disabled; skipping external OCR call');
      return this.createPlaceholderResult(requestPayload, 'none');
    }

    if (this.providerName === 'azure') {
      return this.extractUsingAzure(requestPayload);
    }

    return this.extractUsingGoogle(requestPayload);
  }

  private async extractUsingAzure(requestPayload: ClassicalOcrRequest): Promise<OcrExtractionResult> {
    if (!this.azureEndpoint || !this.azureKey) {
      applicationLogger.warn('Azure OCR configuration missing; returning placeholder OCR result');

      console.log('[Classical OCR Placeholder] Missing Azure credentials; returning placeholder response');
      return this.createPlaceholderResult(requestPayload, 'azure');
    }

    applicationLogger.info({ fileName: requestPayload.originalFileName }, 'Azure OCR adapter stub called');
    console.log('[Classical OCR Placeholder] Would call Azure Computer Vision Read API');

    return this.createPlaceholderResult(requestPayload, 'azure');
  }

  private async extractUsingGoogle(requestPayload: ClassicalOcrRequest): Promise<OcrExtractionResult> {
    if (!this.googleProjectId || !this.googleCredentialsPath) {
      applicationLogger.warn('Google OCR configuration missing; returning placeholder OCR result');

      console.log('[Classical OCR Placeholder] Missing Google credentials; returning placeholder response');
      return this.createPlaceholderResult(requestPayload, 'google');
    }

    applicationLogger.info({ fileName: requestPayload.originalFileName }, 'Google OCR adapter stub called');
    console.log('[Classical OCR Placeholder] Would call Google Cloud Vision API');

    return this.createPlaceholderResult(requestPayload, 'google');
  }

  private createPlaceholderResult(
    requestPayload: ClassicalOcrRequest,
    providerName: ClassicalOcrProvider
  ): OcrExtractionResult {
    return {
      providerName,
      rawText: '',
      lines: [],
      metadata: {
        originalFileName: requestPayload.originalFileName,
        mimeType: requestPayload.mimeType,
        placeholder: true
      }
    };
  }
}
