import { FormEvent } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

export const AppFooter = () => {
  const originalServings = useRecipeWorkspaceStore((state) => state.originalServings);
  const targetServings = useRecipeWorkspaceStore((state) => state.targetServings);
  const setServings = useRecipeWorkspaceStore((state) => state.setServings);

  const handleTargetServingsChange = (event: FormEvent<HTMLInputElement>) => {
    const nextValue = Number(event.currentTarget.value);
    setServings(originalServings, Number.isNaN(nextValue) ? null : nextValue);
    console.log('[AppFooter Placeholder] Updated target servings input');
  };

  const handleOriginalServingsChange = (event: FormEvent<HTMLInputElement>) => {
    const nextValue = Number(event.currentTarget.value);
    setServings(Number.isNaN(nextValue) ? null : nextValue, targetServings);
    console.log('[AppFooter Placeholder] Updated original servings input');
  };

  const handleScaleRecipe = () => {
    console.log('[AppFooter Placeholder] Triggered recipe scaling operation');
  };

  const handleExportJson = () => {
    console.log('[AppFooter Placeholder] Triggered JSON export');
  };

  const handleExportText = () => {
    console.log('[AppFooter Placeholder] Triggered TXT export');
  };

  const handleDriveUpload = () => {
    console.log('[AppFooter Placeholder] Triggered Google Drive upload');
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 px-6 py-4 text-sm text-slate-200">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="original-servings">
            Original Servings
          </label>
          <input
            id="original-servings"
            type="number"
            min={1}
            className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
            value={originalServings ?? ''}
            onInput={handleOriginalServingsChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="target-servings">
            Target Servings
          </label>
          <input
            id="target-servings"
            type="number"
            min={1}
            className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
            value={targetServings ?? ''}
            onInput={handleTargetServingsChange}
          />
        </div>
        <button
          type="button"
          className="rounded-md border border-brand-primary bg-brand-primary/20 px-3 py-1.5 font-semibold text-brand-primary transition hover:bg-brand-primary/30"
          onClick={handleScaleRecipe}
        >
          Scale Recipe
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-brand-secondary hover:text-brand-secondary"
            type="button"
            onClick={handleExportJson}
          >
            Export JSON
          </button>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-brand-secondary hover:text-brand-secondary"
            type="button"
            onClick={handleExportText}
          >
            Export TXT
          </button>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-brand-secondary hover:text-brand-secondary"
            type="button"
            onClick={handleDriveUpload}
          >
            Upload to Drive
          </button>
        </div>
      </div>
    </footer>
  );
};
