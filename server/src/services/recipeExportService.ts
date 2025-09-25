import type { ParsedRecipe, RecipeExportFormat } from '@xr/shared';

const formatQuantity = (recipe: ParsedRecipe, ingredientIndex: number): string => {
  const quantity = recipe.ingredients[ingredientIndex].quantity;

  if (quantity === null) {
    return '';
  }

  if (typeof quantity === 'number') {
    return quantity.toString();
  }

  return `${quantity.min}-${quantity.max}`;
};

const buildTextExport = (recipe: ParsedRecipe): string => {
  const lines: string[] = [];

  lines.push(`# ${recipe.title || 'Untitled Recipe'}`);
  if (typeof recipe.originalServings === 'number') {
    lines.push(`Servings: ${recipe.originalServings}`);
  }

  lines.push('');
  lines.push('## Ingredients');

  for (const [index, ingredient] of recipe.ingredients.entries()) {
    const quantityValue = formatQuantity(recipe, index);
    const unitValue = ingredient.unit ? ` ${ingredient.unit}` : '';
    const noteValue = ingredient.note ? ` (${ingredient.note})` : '';
    const formattedLine = `- ${quantityValue}${unitValue} ${ingredient.ingredient}${noteValue}`.trim();
    lines.push(formattedLine);
  }

  lines.push('');
  lines.push('## Instructions');

  for (const [index, instruction] of recipe.instructions.entries()) {
    lines.push(`${index + 1}. ${instruction}`);
  }

  if (recipe.warnings.length > 0) {
    lines.push('');
    lines.push('## Warnings');
    for (const warning of recipe.warnings) {
      lines.push(`- [${warning.severity.toUpperCase()}] ${warning.message} (${warning.pointer})`);
    }
  }

  return lines.join('\n');
};

export class RecipeExportService {
  export(recipe: ParsedRecipe, format: RecipeExportFormat): { content: string; mimeType: string; fileName: string } {
    if (format === 'json') {
      return {
        content: JSON.stringify(recipe, null, 2),
        mimeType: 'application/json',
        fileName: `${recipe.title || 'recipe'}.json`
      };
    }

    return {
      content: buildTextExport(recipe),
      mimeType: 'text/plain',
      fileName: `${recipe.title || 'recipe'}.txt`
    };
  }
}
