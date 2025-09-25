import { ClassicalOcrAdapter } from './adapters/classicalOcrAdapter';
import { OcrOrchestratorService } from './services/ocrOrchestrator';
import { RecipeParserService } from './services/recipeParserService';
import { RecipeValidationService } from './services/recipeValidationService';
import { RecipeScalingService } from './services/recipeScalingService';
import { RecipeExportService } from './services/recipeExportService';

const classicalOcrAdapter = new ClassicalOcrAdapter();

export const ocrOrchestratorService = new OcrOrchestratorService(classicalOcrAdapter);
export const recipeParserService = new RecipeParserService();
export const recipeValidationService = new RecipeValidationService();
export const recipeScalingService = new RecipeScalingService();
export const recipeExportService = new RecipeExportService();
