import fetch, { Response } from 'node-fetch';
import { ParsedRecipe, VisionExtractionResult } from '@xr/shared';
import { applicationConfiguration } from '../config/env';
import { applicationLogger } from '../logger';

export interface OpenAiVisionRequest {
  ocrTextLines: string[];
  imageUrl?: string;
  imageBase64?: string;
  userPromptOverride?: string;
}

export class OpenAiVisionAdapter {
  private readonly apiKey = applicationConfiguration.openAi.apiKey;
  private readonly baseUrl = applicationConfiguration.openAi.baseUrl;
  private readonly visionModel = applicationConfiguration.openAi.visionModel;
  private readonly requestTimeoutMilliseconds = applicationConfiguration.openAi.requestTimeoutMilliseconds;

  async extractStructuredRecipe(
    requestPayload: OpenAiVisionRequest
  ): Promise<VisionExtractionResult> {
    console.log('[OpenAI Vision Placeholder] Preparing request payload', {
      textLineCount: requestPayload.ocrTextLines.length,
      hasImageUrl: Boolean(requestPayload.imageUrl),
      hasImageBase64: Boolean(requestPayload.imageBase64)
    });

    if (!this.apiKey || this.apiKey === 'replace-me') {
      applicationLogger.warn('OpenAI API key not configured; returning OCR-only fallback result');

      console.log('[OpenAI Vision Placeholder] Skipping API call because OPENAI_API_KEY is missing');

      return {
        parsedRecipe: null,
        rawText: requestPayload.ocrTextLines.join('\n'),
        providerName: 'openai',
        warnings: ['OpenAI adapter not configured']
      };
    }

    const promptSegments: string[] = this.buildPromptSegments(requestPayload);

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.requestTimeoutMilliseconds);

    try {
      console.log('[OpenAI Vision Placeholder] Would call OpenAI Responses API', {
        visionModel: this.visionModel,
        segmentCount: promptSegments.length
      });

      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.visionModel,
          input: promptSegments
        }),
        signal: controller.signal
      });

      const parsedBody = await this.parseResponse(response);
      const parsedRecipe = this.coerceParsedRecipe(parsedBody);

      return {
        parsedRecipe,
        rawText: requestPayload.ocrTextLines.join('\n'),
        providerName: 'openai',
        warnings: parsedBody?.warnings ?? []
      };
    } catch (error) {
      applicationLogger.error({ err: error }, 'Failed to call OpenAI vision adapter');

      return {
        parsedRecipe: null,
        rawText: requestPayload.ocrTextLines.join('\n'),
        providerName: 'openai',
        warnings: ['OpenAI vision adapter failure']
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private buildPromptSegments(requestPayload: OpenAiVisionRequest): string[] {
    const instructionSegment =
      requestPayload.userPromptOverride ??
      'You are an extraction engine. Output JSON with keys title, originalServings, ingredients[], instructions[], warnings[]. Unknown values should be null.';

    const ocrTextSegment = requestPayload.ocrTextLines.join('\n');

    return [instructionSegment, ocrTextSegment].filter(Boolean);
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API responded with ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  private coerceParsedRecipe(responseBody: unknown): ParsedRecipe | null {
    if (!responseBody || typeof responseBody !== 'object') {
      return null;
    }

    const candidate = responseBody as Partial<{ output: Array<{ content: Array<{ text: string }> }> }>;
    const contentText = candidate.output?.[0]?.content?.[0]?.text;

    if (!contentText) {
      return null;
    }

    try {
      const parsed = JSON.parse(contentText) as ParsedRecipe;
      return parsed;
    } catch (error) {
      applicationLogger.warn({ err: error }, 'Failed to parse OpenAI structured recipe payload');
      return null;
    }
  }
}
