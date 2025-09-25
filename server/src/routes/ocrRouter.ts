import { Router } from 'express';
import { z } from 'zod';
import { ocrOrchestratorService } from '../container';
import { HttpError } from '../middlewares/errorHandler';

const imageOcrRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
  originalFileName: z.string().min(1).default('uploaded-image')
});

export const ocrRouter = Router();

ocrRouter.post('/ocr/image', async (request, response, next) => {
  try {
    const parsedBody = imageOcrRequestSchema.parse(request.body);
    const cleanedBase64Payload = parsedBody.imageBase64.replace(/^data:.+;base64,/, '');

    if (cleanedBase64Payload.length === 0) {
      throw new HttpError(400, 'Image payload is empty');
    }

    const imageBuffer = Buffer.from(cleanedBase64Payload, 'base64');

    const classicalOcrResult = await ocrOrchestratorService.processImageBuffer(
      imageBuffer,
      parsedBody.mimeType,
      parsedBody.originalFileName
    );

    response.json({
      data: classicalOcrResult
    });
  } catch (error) {
    next(error);
  }
});
