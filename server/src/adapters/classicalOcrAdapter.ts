import { OcrExtractionResult, OcrTextLine } from '@xr/shared';
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
  private readonly googleVisionApiKey = applicationConfiguration.classicalOcr.googleVisionApiKey;

  async extractTextFromImage(requestPayload: ClassicalOcrRequest): Promise<OcrExtractionResult> {
    applicationLogger.info(
      { providerName: this.providerName, mimeType: requestPayload.mimeType, fileName: requestPayload.originalFileName },
      'Processing image via classical OCR adapter'
    );

    if (this.providerName === 'none') {
      applicationLogger.info({ fileName: requestPayload.originalFileName }, 'Skipping classical OCR - provider disabled');
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
      return this.createPlaceholderResult(requestPayload, 'azure');
    }

    const base = this.azureEndpoint.replace(/\/+$/, '');
    const url = `${base}/vision/v3.2/read/analyze`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const analyzeResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureKey,
          'Content-Type': requestPayload.mimeType || 'application/octet-stream'
        },
        body: requestPayload.imageBuffer,
        signal: controller.signal as AbortSignal
      } as RequestInit);

      if (analyzeResponse.status !== 202) {
        const text = await analyzeResponse.text();
        throw new Error(`Azure analyze failed: ${analyzeResponse.status} ${text}`);
      }

      const operationLocation = analyzeResponse.headers.get('operation-location');
      if (!operationLocation) {
        throw new Error('Azure analyze missing operation-location header');
      }

      const startedAt = Date.now();
      let resultJson: any | null = null;
      while (Date.now() - startedAt < 60000) {
        await new Promise((r) => setTimeout(r, 1200));
        const resultResponse = await fetch(operationLocation, {
          headers: { 'Ocp-Apim-Subscription-Key': this.azureKey },
          signal: controller.signal as AbortSignal
        } as RequestInit);
        if (!resultResponse.ok) {
          const t = await resultResponse.text();
          throw new Error(`Azure result failed: ${resultResponse.status} ${t}`);
        }
        const json = (await resultResponse.json()) as any;
        const status = (json.status ?? json.statusCode ?? '').toString().toLowerCase();
        if (status === 'succeeded') {
          resultJson = json;
          break;
        }
        if (status === 'failed') {
          throw new Error('Azure read operation failed');
        }
      }

      if (!resultJson) {
        throw new Error('Azure read operation timed out');
      }

      const { lines, rawText } = this.parseAzureReadResult(resultJson);

      return {
        providerName: 'azure',
        lines,
        rawText,
        metadata: {
          originalFileName: requestPayload.originalFileName,
          mimeType: requestPayload.mimeType
        }
      };
    } catch (error) {
      applicationLogger.error({ err: error }, 'Azure OCR adapter failure');
      return this.createPlaceholderResult(requestPayload, 'azure');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async extractUsingGoogle(requestPayload: ClassicalOcrRequest): Promise<OcrExtractionResult> {
    if (!this.googleVisionApiKey) {
      applicationLogger.warn('Google Vision API key not configured; returning placeholder OCR result');
      return this.createPlaceholderResult(requestPayload, 'google');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(
        this.googleVisionApiKey
      )}`;

      const body = {
        requests: [
          {
            image: { content: requestPayload.imageBuffer.toString('base64') },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' as const }]
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal as AbortSignal
      } as RequestInit);

      if (!response.ok) {
        const t = await response.text();
        throw new Error(`Google Vision error: ${response.status} ${t}`);
      }

      const json = (await response.json()) as any;
      const { lines, rawText } = this.parseGoogleVisionResult(json);

      return {
        providerName: 'google',
        lines,
        rawText,
        metadata: {
          originalFileName: requestPayload.originalFileName,
          mimeType: requestPayload.mimeType
        }
      };
    } catch (error) {
      applicationLogger.error({ err: error }, 'Google Vision OCR adapter failure');
      return this.createPlaceholderResult(requestPayload, 'google');
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseAzureReadResult(json: any): { lines: OcrTextLine[]; rawText: string } {
    const analyzeResult = json.analyzeResult ?? json;
    const readResults = analyzeResult?.readResults ?? analyzeResult?.pages ?? [];
    const collectedLines: OcrTextLine[] = [];

    for (const page of readResults) {
      const pageLines = page.lines ?? [];
      for (const line of pageLines) {
        const text = line.text ?? '';
        const points: number[] = line.boundingBox ?? [];
        let boundingBox = null;
        if (Array.isArray(points) && points.length >= 8) {
          const xs = [points[0], points[2], points[4], points[6]];
          const ys = [points[1], points[3], points[5], points[7]];
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);
          boundingBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY, rotation: undefined };
        }
        collectedLines.push({ text, confidence: null, boundingBox });
      }
    }

    return { lines: collectedLines, rawText: collectedLines.map((l) => l.text).join('\n') };
  }

  private parseGoogleVisionResult(json: any): { lines: OcrTextLine[]; rawText: string } {
    const response = json?.responses?.[0];
    const fullText = response?.fullTextAnnotation?.text as string | undefined;
    const text = fullText ?? (response?.textAnnotations?.[0]?.description as string | undefined) ?? '';
    const linesArray = text.split(/\r?\n/).filter((l) => l.length > 0);
    const lines: OcrTextLine[] = linesArray.map((t) => ({ text: t, confidence: null, boundingBox: null }));
    return { lines, rawText: text };
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

