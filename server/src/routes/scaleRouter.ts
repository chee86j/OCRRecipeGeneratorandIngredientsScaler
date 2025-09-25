import { Router } from 'express';
import { z } from 'zod';
import { recipeScalingService } from '../container';
import type { ParsedRecipe } from '@xr/shared';
import { parsedRecipeSchema } from './schemas';

const scaleRequestSchema = z.object({
  recipe: parsedRecipeSchema,
  originalServings: z.number().positive(),
  targetServings: z.number().positive()
});

export const scaleRouter = Router();

scaleRouter.post('/scale', (request, response, next) => {
  try {
    const body = scaleRequestSchema.parse(request.body);
    const parsedRecipe = body.recipe as ParsedRecipe;
    const scaledRecipe = recipeScalingService.scale(parsedRecipe, body.originalServings, body.targetServings);

    response.json({ recipe: scaledRecipe, scaling: { originalServings: body.originalServings, targetServings: body.targetServings } });
  } catch (error) {
    next(error);
  }
});

