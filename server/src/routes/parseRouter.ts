import { Router } from 'express';
import { z } from 'zod';
import { recipeParserService } from '../container';
import { HttpError } from '../middlewares/errorHandler';

const parseRequestSchema = z.object({
  lines: z.array(z.string()),
  title: z.string().optional(),
  originalServings: z.number().nullable().optional()
});

export const parseRouter = Router();

parseRouter.post('/parse', (request, response, next) => {
  try {
    const body = parseRequestSchema.parse(request.body);

    if (body.lines.length === 0) {
      throw new HttpError(400, 'Cannot parse an empty set of lines');
    }

    const parseResult = recipeParserService.parseLines({
      lines: body.lines,
      title: body.title,
      originalServings: body.originalServings ?? null
    });

    response.json({ recipe: parseResult.recipe, warnings: parseResult.warnings });
  } catch (error) {
    next(error);
  }
});
