import { ChangeEvent, Fragment } from 'react';
import type { ParsedRecipe } from '@xr/shared';

type RecipeTabIdentifier = 'extracted-text' | 'structured-recipe' | 'xr-preview';

interface RecipeTabsProps {
  activeTabIdentifier: RecipeTabIdentifier;
  onTabChange: (nextTabIdentifier: RecipeTabIdentifier) => void;
  extractedTextDraft: string;
  onExtractedTextChange: (nextDraft: string) => void;
  parsedRecipeDraft: ParsedRecipe | null;
}

const tabDefinitions: Array<{ identifier: RecipeTabIdentifier; label: string }> = [
  { identifier: 'extracted-text', label: 'Extracted Text' },
  { identifier: 'structured-recipe', label: 'Structured Recipe' },
  { identifier: 'xr-preview', label: 'XR Preview' }
];

export const RecipeTabs = ({
  activeTabIdentifier,
  onTabChange,
  extractedTextDraft,
  onExtractedTextChange,
  parsedRecipeDraft
}: RecipeTabsProps) => {
  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onExtractedTextChange(event.target.value);
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <nav className="flex gap-2 border-b border-slate-800 bg-slate-950/60 px-6 py-3">
        {tabDefinitions.map((tab) => {
          const isActive = tab.identifier === activeTabIdentifier;
          return (
            <button
              key={tab.identifier}
              type="button"
              onClick={() => onTabChange(tab.identifier)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-primary/20 text-brand-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <section className="flex-1 overflow-y-auto bg-slate-950 px-6 py-6">
        {activeTabIdentifier === 'extracted-text' && (
          <textarea
            value={extractedTextDraft}
            onChange={handleTextareaChange}
            className="min-h-[420px] w-full rounded-lg border border-slate-800 bg-slate-900 p-4 font-mono text-sm text-slate-100 shadow-inner focus:border-brand-primary focus:outline-none"
            placeholder="OCR output will appear here for confirmation."
          />
        )}
        {activeTabIdentifier === 'structured-recipe' && (
          <div className="space-y-6">
            {parsedRecipeDraft ? (
              <Fragment>
                <div>
                  <h3 className="text-xl font-semibold">{parsedRecipeDraft.title}</h3>
                  <p className="text-sm text-slate-400">
                    Servings: {parsedRecipeDraft.originalServings ?? 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Ingredients</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {parsedRecipeDraft.ingredients.map((ingredient) => (
                      <li key={`${ingredient.ingredient}-${ingredient.raw}`} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
                        <span className="font-semibold text-brand-secondary">
                          {ingredient.quantity ?? '—'} {ingredient.unit ?? ''}
                        </span>{' '}
                        {ingredient.ingredient}{' '}
                        {ingredient.note ? <span className="text-slate-400">({ingredient.note})</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Instructions</h4>
                  <ol className="mt-2 space-y-2 text-sm text-slate-200">
                    {parsedRecipeDraft.instructions.map((instruction, index) => (
                      <li key={instruction} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
                        <span className="mr-2 font-semibold text-brand-accent">Step {index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </Fragment>
            ) : (
              <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                Structured results will appear here after parsing. Run the OCR flow to populate this view.
              </div>
            )}
          </div>
        )}
        {activeTabIdentifier === 'xr-preview' && (
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-primary">XR Recipe Board</h3>
            <p className="mt-2 text-sm text-slate-300">
              Preview the immersive cooking assistant. This panel will mirror the structured recipe and timers
              in WebXR-capable browsers.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-200 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next Action</h4>
                <p className="mt-2 text-base">Say "Next step" or tap the air button to continue.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timers</h4>
                <p className="mt-2 text-base">Voice command "Start eight minute timer" to kick off countdowns.</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
