import { ClassicalOcrAdapter } from './adapters/classicalOcrAdapter';
import { OpenAiVisionAdapter } from './adapters/openaiAdapter';
import { OcrOrchestratorService } from './services/ocrOrchestrator';

const classicalOcrAdapter = new ClassicalOcrAdapter();
const openAiVisionAdapter = new OpenAiVisionAdapter();

export const ocrOrchestratorService = new OcrOrchestratorService(
  classicalOcrAdapter,
  openAiVisionAdapter
);
