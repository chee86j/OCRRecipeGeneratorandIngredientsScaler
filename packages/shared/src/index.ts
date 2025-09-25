export type IsoDateString = `${number}-${number}-${number}T${string}Z`;

export interface QuantityRange {
  min: number;
  max: number;
}

export type IngredientQuantity = number | QuantityRange | null;

export type NormalizedUnit =
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'oz'
  | 'lb'
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'pinch'
  | 'dash'
  | 'to-taste';

export interface ParsedRecipeIngredient {
  raw: string;
  quantity: IngredientQuantity;
  unit: NormalizedUnit | null;
  ingredient: string;
  note?: string | null;
}

export type RecipeSourceType = 'ocr' | 'voice' | 'manual' | 'hybrid';

export type ValidationWarningSeverity = 'info' | 'warning' | 'error';

export type ValidationWarningCode =
  | 'missing-title'
  | 'missing-ingredients'
  | 'missing-instructions'
  | 'unknown-unit'
  | 'quantity-out-of-range'
  | 'unparsed-line'
  | 'empty-ingredient';

export interface ValidationWarning {
  code: ValidationWarningCode;
  message: string;
  pointer: string;
  severity: ValidationWarningSeverity;
}

export interface ParsedRecipe {
  id: string;
  title: string;
  sourceType: RecipeSourceType;
  originalServings: number | null;
  ingredients: ParsedRecipeIngredient[];
  instructions: string[];
  warnings: ValidationWarning[];
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

export type ClassicalOcrProviderName = 'azure' | 'google' | 'none';

export interface OcrExtractionResult {
  providerName: ClassicalOcrProviderName;
  lines: OcrTextLine[];
  rawText: string;
  metadata: Record<string, unknown>;
}

export type RecipeExportFormat = 'txt' | 'json';
