import type {
  OcrExtractionResult,
  ParsedRecipe,
  RecipeExportFormat,
  ValidationWarning
} from '@xr/shared';

const API_BASE_URL = (import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const postJson = async <TResponse>(path: string, body: unknown): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request to ${path} failed with ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<TResponse>;
};

export const requestOcrImage = async (payload: {
  imageBase64: string;
  mimeType: string;
  originalFileName: string;
}): Promise<OcrExtractionResult> => {
  const result = await postJson<{ data: OcrExtractionResult }>('/api/ocr/image', payload);
  return result.data;
};

export const requestParseLines = async (payload: {
  lines: string[];
  title?: string;
  originalServings?: number | null;
}): Promise<{ recipe: ParsedRecipe; warnings: ValidationWarning[] }> => {
  return postJson<{ recipe: ParsedRecipe; warnings: ValidationWarning[] }>('/api/parse', payload);
};

export const requestValidateRecipe = async (
  recipe: ParsedRecipe
): Promise<{ recipe: ParsedRecipe; warnings: ValidationWarning[] }> => {
  return postJson<{ recipe: ParsedRecipe; warnings: ValidationWarning[] }>('/api/validate', { recipe });
};

export const requestScaleRecipe = async (payload: {
  recipe: ParsedRecipe;
  originalServings: number;
  targetServings: number;
}): Promise<{ recipe: ParsedRecipe; scaling: { originalServings: number; targetServings: number } }> => {
  return postJson<{ recipe: ParsedRecipe; scaling: { originalServings: number; targetServings: number } }>('/api/scale', payload);
};

export const requestExportRecipe = async (payload: {
  recipe: ParsedRecipe;
  format: RecipeExportFormat;
}): Promise<{ content: string; mimeType: string; fileName: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request to /api/export failed with ${response.status}: ${errorText}`);
  }

  const content = await response.text();
  const contentDisposition = response.headers.get('Content-Disposition');
  const fileNameMatch = contentDisposition?.match(/filename="(?<name>.+)"/);
  const fileName = fileNameMatch?.groups?.name ?? `recipe.${payload.format}`;
  const mimeType = response.headers.get('Content-Type') ?? 'text/plain';

  return { content, mimeType, fileName };
};
