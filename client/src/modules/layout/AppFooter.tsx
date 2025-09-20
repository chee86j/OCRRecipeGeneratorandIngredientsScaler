import { FormEvent } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

const AppFooter = () => {
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
            className="pill-button bg-brand-primary text-white shadow-soft shadow-brand-primary/40"
            onClick={handleScaleRecipe}
          >
            Scale Recipe
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="pill-button border border-white/70 bg-white/70 text-neutral-700 hover:bg-white"
            type="button"
            onClick={handleExportJson}
          >
            Export JSON
          </button>
          <button
            className="pill-button border border-white/70 bg-white/70 text-neutral-700 hover:bg-white"
            type="button"
            onClick={handleExportText}
          >
            Export TXT
          </button>
          <button
            className="pill-button bg-brand-secondary/20 text-brand-secondary"
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

export { AppFooter };
export default AppFooter;
