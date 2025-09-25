import type { ParsedRecipe } from '@xr/shared';

const scaleQuantity = (
  quantity: ParsedRecipe['ingredients'][number]['quantity'],
  factor: number
): ParsedRecipe['ingredients'][number]['quantity'] => {
  if (quantity === null) {
    return null;
  }

  if (typeof quantity === 'number') {
    return Number((quantity * factor).toFixed(4));
  }

  return {
    min: Number((quantity.min * factor).toFixed(4)),
    max: Number((quantity.max * factor).toFixed(4))
  };
};

export class RecipeScalingService {
  scale(recipe: ParsedRecipe, originalServings: number, targetServings: number): ParsedRecipe {
    const factor = targetServings / (originalServings || targetServings || 1);

    const scaledIngredients = recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: scaleQuantity(ingredient.quantity, factor)
    }));

    return {
      ...recipe,
      ingredients: scaledIngredients,
      originalServings,
      warnings: recipe.warnings
    };
  }
}
