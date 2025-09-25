import { v4 as uuidv4 } from 'uuid';
import type {
  IsoDateString,
  NormalizedUnit,
  ParsedRecipe,
  ParsedRecipeIngredient,
  QuantityRange,
  ValidationWarning
} from '@xr/shared';

const UNICODE_FRACTIONS: Record<string, string> = {
  '\u00BD': '1/2',
  '\u2153': '1/3',
  '\u2154': '2/3',
  '\u00BC': '1/4',
  '\u00BE': '3/4',
  '\u2155': '1/5',
  '\u2156': '2/5',
  '\u2157': '3/5',
  '\u2158': '4/5',
  '\u2159': '1/6',
  '\u215A': '5/6',
  '\u215B': '1/8',
  '\u215C': '3/8',
  '\u215D': '5/8',
  '\u215E': '7/8'
};

const UNIT_ALIASES: Record<string, NormalizedUnit> = {
  tsp: 'tsp',
  tsps: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  t: 'tsp',
  tbsp: 'tbsp',
  tbsps: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tbspn: 'tbsp',
  cup: 'cup',
  cups: 'cup',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  pinch: 'pinch',
  pinches: 'pinch',
  dash: 'dash',
  dashes: 'dash'
};

const TO_TASTE_PATTERNS = [/to\s*taste/i, /season\s+to\s+taste/i];

const normalizeFractions = (input: string): string => {
  return input
    .split('')
    .map((character) => UNICODE_FRACTIONS[character] ?? character)
    .join('');
};

const parseFraction = (token: string): number | null => {
  const trimmed = token.trim();
  if (!trimmed.includes('/')) {
    return null;
  }

  const [numeratorRaw, denominatorRaw] = trimmed.split('/');
  const numerator = Number(numeratorRaw);
  const denominator = Number(denominatorRaw);

  if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
};

const parseQuantityToken = (token: string): number | null => {
  const normalizedToken = normalizeFractions(token);
  const parts = normalizedToken.split(' ');

  if (parts.length === 2) {
    const whole = Number(parts[0]);
    const fraction = parseFraction(parts[1]);

    if (!Number.isNaN(whole) && fraction !== null) {
      return whole + fraction;
    }
  }

  if (normalizedToken.includes('/')) {
    const fractionValue = parseFraction(normalizedToken);
    if (fractionValue !== null) {
      return fractionValue;
    }
  }

  const numericValue = Number(normalizedToken);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return null;
};

const parseQuantityRange = (token: string): QuantityRange | null => {
  const normalizedToken = normalizeFractions(token)
    .replace(/\sto\s/gi, '-')
    .replace(/[\u2012\u2013\u2014\u2015]/g, '-');

  const rangeMatch = normalizedToken.match(/^(?<min>[^-]+)-(?<max>.+)$/);

  if (!rangeMatch || !rangeMatch.groups) {
    return null;
  }

  const minQuantity = parseQuantityToken(rangeMatch.groups.min);
  const maxQuantity = parseQuantityToken(rangeMatch.groups.max);

  if (minQuantity === null || maxQuantity === null) {
    return null;
  }

  return {
    min: minQuantity,
    max: maxQuantity
  };
};

const extractParentheticalNote = (input: string): { text: string; note: string | null } => {
  const noteMatch = input.match(/^(?<text>[^()]+)\((?<note>[^)]+)\)\s*$/);

  if (!noteMatch || !noteMatch.groups) {
    return { text: input.trim(), note: null };
  }

  return {
    text: noteMatch.groups.text.trim(),
    note: noteMatch.groups.note.trim()
  };
};

const normalizeUnit = (candidate: string | undefined): NormalizedUnit | null => {
  if (!candidate) {
    return null;
  }

  const normalizedCandidate = candidate.trim().toLowerCase();

  return UNIT_ALIASES[normalizedCandidate] ?? null;
};

const sanitizeLine = (line: string): string => line.replace(/\s+/g, ' ').trim();

const isSectionHeader = (line: string, header: string): boolean => line.toLowerCase() === header;

const splitSections = (lines: string[]): { ingredientLines: string[]; instructionLines: string[] } => {
  const sanitizedLines = lines.map(sanitizeLine).filter((line) => line.length > 0);

  let ingredientsStartIndex = sanitizedLines.findIndex((line) => isSectionHeader(line, 'ingredients'));
  let instructionsStartIndex = sanitizedLines.findIndex((line) => isSectionHeader(line, 'instructions') || isSectionHeader(line, 'directions'));

  if (ingredientsStartIndex === -1 && instructionsStartIndex === -1) {
    const midpoint = Math.floor(sanitizedLines.length / 2);
    return {
      ingredientLines: sanitizedLines.slice(0, midpoint),
      instructionLines: sanitizedLines.slice(midpoint)
    };
  }

  if (ingredientsStartIndex === -1) {
    ingredientsStartIndex = 0;
  }

  if (instructionsStartIndex === -1 || instructionsStartIndex < ingredientsStartIndex) {
    instructionsStartIndex = sanitizedLines.length;
  }

  const ingredientLines = sanitizedLines.slice(ingredientsStartIndex + 1, instructionsStartIndex);
  const instructionLines = sanitizedLines.slice(instructionsStartIndex + 1);

  return {
    ingredientLines,
    instructionLines
  };
};

const parseIngredientLine = (line: string): ParsedRecipeIngredient => {
  const sanitized = sanitizeLine(line);
  const loweredLine = sanitized.toLowerCase();

  if (TO_TASTE_PATTERNS.some((pattern) => pattern.test(loweredLine))) {
    return {
      raw: line,
      quantity: null,
      unit: 'to-taste',
      ingredient: sanitized,
      note: null
    };
  }

  const firstToken = sanitized.split(' ')[0];
  const range = parseQuantityRange(firstToken);

  if (range) {
    const withoutRange = sanitized.substring(firstToken.length).trim();
    const [unitCandidate, ...restTokens] = withoutRange.split(' ');
    const normalizedUnit = normalizeUnit(unitCandidate);
    const restText = normalizedUnit ? restTokens.join(' ') : [unitCandidate, ...restTokens].join(' ');
    const { text, note } = extractParentheticalNote(restText);

    return {
      raw: line,
      quantity: range,
      unit: normalizedUnit,
      ingredient: text,
      note
    };
  }

  const tokens = sanitized.split(' ');
  const [quantityToken, possibleUnit, ...remainingTokens] = tokens;
  const quantity = parseQuantityToken(quantityToken);

  if (quantity !== null) {
    const normalizedUnit = normalizeUnit(possibleUnit);
    const restTokens = normalizedUnit ? remainingTokens : [possibleUnit, ...remainingTokens];
    const restText = restTokens.join(' ').trim();
    const { text, note } = extractParentheticalNote(restText);

    return {
      raw: line,
      quantity,
      unit: normalizedUnit,
      ingredient: text,
      note
    };
  }

  return {
    raw: line,
    quantity: null,
    unit: null,
    ingredient: sanitized,
    note: null
  };
};

export class RecipeParserService {
  parseLines(request: { lines: string[]; title?: string; originalServings?: number | null }): {
    recipe: ParsedRecipe;
    warnings: ValidationWarning[];
  } {
    const { lines, title, originalServings = null } = request;

    const { ingredientLines, instructionLines } = splitSections(lines);

    const parsedIngredients = ingredientLines.map(parseIngredientLine);
    const parsedInstructions = instructionLines.filter((line) => line.length > 0);

    const warnings: ValidationWarning[] = [];

    if (parsedIngredients.length === 0) {
      warnings.push({
        code: 'missing-ingredients',
        message: 'No ingredients detected in the supplied text.',
        pointer: 'ingredients',
        severity: 'warning'
      });
    }

    if (parsedInstructions.length === 0) {
      warnings.push({
        code: 'missing-instructions',
        message: 'No instructions detected in the supplied text.',
        pointer: 'instructions',
        severity: 'warning'
      });
    }

    const generatedRecipe: ParsedRecipe = {
      id: uuidv4(),
      title: title?.trim() ?? '',
      sourceType: 'ocr',
      originalServings,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      warnings,
      createdAt: new Date().toISOString() as IsoDateString
    };

    return { recipe: generatedRecipe, warnings };
  }
}




