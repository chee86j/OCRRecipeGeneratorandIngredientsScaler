import { FormEvent, useCallback } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';
import { requestExportRecipe, requestScaleRecipe } from '@/modules/actions/apiClient';

const AppFooter = () => {
  const originalServings = useRecipeWorkspaceStore((state) => state.originalServings);
  const targetServings = useRecipeWorkspaceStore((state) => state.targetServings);
  const parsedRecipeDraft = useRecipeWorkspaceStore((state) => state.parsedRecipeDraft);
  const setServings = useRecipeWorkspaceStore((state) => state.setServings);
  const setParsedRecipeDraft = useRecipeWorkspaceStore((state) => state.setParsedRecipeDraft);
  const isProcessing = useRecipeWorkspaceStore((state) => state.isProcessing);
  const setProcessing = useRecipeWorkspaceStore((state) => state.setProcessing);

  const handleTargetServingsChange = (event: FormEvent<HTMLInputElement>) => {
    const nextValue = Number(event.currentTarget.value);
    setServings(originalServings, Number.isNaN(nextValue) ? null : nextValue);
  };

  const handleOriginalServingsChange = (event: FormEvent<HTMLInputElement>) => {
    const nextValue = Number(event.currentTarget.value);
    setServings(Number.isNaN(nextValue) ? null : nextValue, targetServings);
  };

  const handleScaleRecipe = useCallback(async () => {
    if (!parsedRecipeDraft || !originalServings || !targetServings) {
      console.log('[AppFooter] Ensure recipe and servings are defined before scaling');
      return;
    }

    try {
      setProcessing(true);
      const { recipe } = await requestScaleRecipe({
        recipe: parsedRecipeDraft,
        originalServings,
        targetServings
      });
      setParsedRecipeDraft(recipe);
    } catch (error) {
      console.error('Failed to scale recipe', error);
    } finally {
      setProcessing(false);
    }
  }, [parsedRecipeDraft, originalServings, targetServings, setParsedRecipeDraft, setProcessing]);

  const handleExport = useCallback(
    async (format: 'json' | 'txt') => {
      if (!parsedRecipeDraft) {
        console.log('[AppFooter] Parse a recipe before exporting');
        return;
      }

      try {
        const exportResult = await requestExportRecipe({ recipe: parsedRecipeDraft, format });
        const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportResult.fileName;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export recipe', error);
      }
    },
    [parsedRecipeDraft]
  );

  return (
    <footer className="mt-auto w-full border-t border-white/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:py-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-inset">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="original-servings">
              Original
            </label>
            <input
              id="original-servings"
              type="number"
              min={1}
              className="w-16 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-center text-sm text-neutral-900 focus:border-brand-primary focus:outline-none"
              value={originalServings ?? ''}
              onInput={handleOriginalServingsChange}
            />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-inset">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="target-servings">
              Target
            </label>
            <input
              id="target-servings"
              type="number"
              min={1}
              className="w-16 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-center text-sm text-neutral-900 focus:border-brand-primary focus:outline-none"
              value={targetServings ?? ''}
              onInput={handleTargetServingsChange}
            />
          </div>
          <button
            type="button"
            className="pill-button bg-brand-primary text-white shadow-soft shadow-brand-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleScaleRecipe}
            disabled={isProcessing || !parsedRecipeDraft}
          >
            Scale Recipe
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="pill-button border border-white/70 bg-white/70 text-neutral-700 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={() => handleExport('json')}
            disabled={!parsedRecipeDraft}
          >
            Export JSON
          </button>
          <button
            className="pill-button border border-white/70 bg-white/70 text-neutral-700 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={() => handleExport('txt')}
            disabled={!parsedRecipeDraft}
          >
            Export TXT
          </button>
        </div>
      </div>
    </footer>
  );
};

export { AppFooter };
export default AppFooter;
