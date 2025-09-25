import type { ParsedRecipe, ValidationWarning } from '@xr/shared';

const isInvalidQuantity = (quantity: ParsedRecipe['ingredients'][number]['quantity']): boolean => {
  if (quantity === null) {
    return false;
  }

  if (typeof quantity === 'number') {
    return quantity <= 0;
  }

  return quantity.min <= 0 || quantity.max <= 0 || quantity.max < quantity.min;
};

export class RecipeValidationService {
  validate(recipe: ParsedRecipe): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (!recipe.title || recipe.title.trim().length === 0) {
      warnings.push({
        code: 'missing-title',
        message: 'Recipe title is missing.',
        pointer: 'title',
        severity: 'warning'
      });
    }

    if (recipe.ingredients.length === 0) {
      warnings.push({
        code: 'missing-ingredients',
        message: 'Recipe has no ingredients.',
        pointer: 'ingredients',
        severity: 'error'
      });
    }

    if (recipe.instructions.length === 0) {
      warnings.push({
        code: 'missing-instructions',
        message: 'Recipe has no instructions.',
        pointer: 'instructions',
        severity: 'error'
      });
    }

    for (const [index, ingredient] of recipe.ingredients.entries()) {
      if (!ingredient.ingredient || ingredient.ingredient.trim().length === 0) {
        warnings.push({
          code: 'empty-ingredient',
          message: `Ingredient ${index + 1} is empty.`,
          pointer: `ingredients[${index}]`,
          severity: 'warning'
        });
      }

      if (isInvalidQuantity(ingredient.quantity)) {
        warnings.push({
          code: 'quantity-out-of-range',
          message: `Ingredient ${index + 1} has an invalid quantity.`,
          pointer: `ingredients[${index}].quantity`,
          severity: 'warning'
        });
      }

      if (ingredient.quantity !== null && ingredient.unit === null) {
        warnings.push({
          code: 'unknown-unit',
          message: `Ingredient ${index + 1} has a quantity without a recognized unit.`,
          pointer: `ingredients[${index}].unit`,
          severity: 'info'
        });
      }
    }

    return warnings;
  }
}
