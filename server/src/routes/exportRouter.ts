import { Router } from 'express';
import { z } from 'zod';
import type { ParsedRecipe } from '@xr/shared';
import { recipeExportService } from '../container';
import { parsedRecipeSchema } from './schemas';

const exportRequestSchema = z.object({
  recipe: parsedRecipeSchema,
  format: z.enum(['txt', 'json'])
});

export const exportRouter = Router();

exportRouter.post('/export', (request, response, next) => {
  try {
    const body = exportRequestSchema.parse(request.body);
    const parsedRecipe = body.recipe as ParsedRecipe;
    const exportResult = recipeExportService.export(parsedRecipe, body.format);

    response
      .status(200)
      .setHeader('Content-Type', exportResult.mimeType)
      .setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`)
      .send(exportResult.content);
  } catch (error) {
    next(error);
  }
});
