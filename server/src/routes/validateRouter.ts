import { Router } from 'express';
import { z } from 'zod';
import { recipeValidationService } from '../container';
import type { ParsedRecipe } from '@xr/shared';
import { parsedRecipeSchema } from './schemas';

const validateRequestSchema = z.object({
  recipe: parsedRecipeSchema
});

export const validateRouter = Router();

validateRouter.post('/validate', (request, response, next) => {
  try {
    const parsedBody = validateRequestSchema.parse(request.body);
    const parsedRecipe = parsedBody.recipe as ParsedRecipe;
    const validationWarnings = recipeValidationService.validate(parsedRecipe);

    response.json({
      recipe: {
        ...parsedRecipe,
        warnings: validationWarnings
      },
      warnings: validationWarnings
    });
  } catch (error) {
    next(error);
  }
});

