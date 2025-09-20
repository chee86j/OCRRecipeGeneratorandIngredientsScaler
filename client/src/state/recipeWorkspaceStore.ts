import { create } from 'zustand';
import type { ParsedRecipe } from '@xr/shared';

interface RecipeWorkspaceState {
  extractedTextDraft: string;
  parsedRecipeDraft: ParsedRecipe | null;
  warnings: string[];
  originalServings: number | null;
  targetServings: number | null;
  isProcessing: boolean;
  setExtractedTextDraft: (nextDraft: string) => void;
  setParsedRecipeDraft: (nextRecipe: ParsedRecipe | null) => void;
  setWarnings: (nextWarnings: string[]) => void;
  setServings: (originalServings: number | null, targetServings: number | null) => void;
  setProcessing: (processingState: boolean) => void;
  resetWorkspace: () => void;
}

const defaultState: Omit<RecipeWorkspaceState,
  | 'setExtractedTextDraft'
  | 'setParsedRecipeDraft'
  | 'setWarnings'
  | 'setServings'
  | 'setProcessing'
  | 'resetWorkspace'
> = {
  extractedTextDraft: '',
  parsedRecipeDraft: null,
  warnings: [],
  originalServings: null,
  targetServings: null,
  isProcessing: false
};

export const useRecipeWorkspaceStore = create<RecipeWorkspaceState>((set) => ({
  ...defaultState,
  setExtractedTextDraft: (nextDraft) => set({ extractedTextDraft: nextDraft }),
  setParsedRecipeDraft: (nextRecipe) => set({ parsedRecipeDraft: nextRecipe }),
  setWarnings: (nextWarnings) => set({ warnings: nextWarnings }),
  setServings: (originalServings, targetServings) => set({ originalServings, targetServings }),
  setProcessing: (processingState) => set({ isProcessing: processingState }),
  resetWorkspace: () => set(defaultState)
}));
