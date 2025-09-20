export type IsoDateString = `${number}-${number}-${number}T${string}Z`;

export interface ParsedRecipeIngredient {
  raw: string;
  quantity: number | null;
  unit: string | null;
  ingredient: string;
  note?: string | null;
}

export interface ParsedRecipe {
  id: string;
  title: string;
  sourceType: 'ocr' | 'voice' | 'manual' | 'hybrid';
  originalServings: number | null;
  ingredients: ParsedRecipeIngredient[];
  instructions: string[];
  warnings: string[];
  createdAt: IsoDateString;
}

export interface OcrTextBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface OcrTextLine {
  text: string;
  confidence: number | null;
  boundingBox: OcrTextBoundingBox | null;
}

export interface OcrExtractionResult {
  providerName: 'azure' | 'google' | 'none';
  lines: OcrTextLine[];
  rawText: string;
  metadata: Record<string, unknown>;
}

export interface VisionExtractionResult {
  parsedRecipe: ParsedRecipe | null;
  rawText: string;
  providerName: 'openai';
  warnings: string[];
}
