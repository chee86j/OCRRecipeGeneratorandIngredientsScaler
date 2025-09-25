import { ChangeEvent, Fragment } from 'react';
import type { IngredientQuantity, ParsedRecipe } from '@xr/shared';

type RecipeTabIdentifier = 'extracted-text' | 'structured-recipe' | 'xr-preview';

interface RecipeTabsProps {
  activeTabIdentifier: RecipeTabIdentifier;
  onTabChange: (nextTabIdentifier: RecipeTabIdentifier) => void;
  extractedTextDraft: string;
  onExtractedTextChange: (nextDraft: string) => void;
  parsedRecipeDraft: ParsedRecipe | null;
}

const tabDefinitions: Array<{ identifier: RecipeTabIdentifier; label: string; description: string }> = [
  { identifier: 'extracted-text', label: 'Review Text', description: 'Confirm OCR output' },
  { identifier: 'structured-recipe', label: 'Recipe View', description: 'Curated ingredients and steps' },
  { identifier: 'xr-preview', label: 'XR Board', description: 'Immersive cooking overlay' }
];

const formatQuantity = (quantity: IngredientQuantity): string => {
  if (quantity === null) {
    return '--';
  }

  if (typeof quantity === 'number') {
    return quantity.toString();
  }

  return `${quantity.min}-${quantity.max}`;
};

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
    <div className="flex-1">
      <div className="flex w-full flex-col gap-6 pb-8 pt-6">
        <nav
          className="mx-auto w-full max-w-xl rounded-full border border-white/70 bg-white/80 p-1 backdrop-blur"
          role="tablist"
        >
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
            {tabDefinitions.map((tab) => {
              const isActive = tab.identifier === activeTabIdentifier;
              return (
                <button
                  key={tab.identifier}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.identifier)}
                  className={`group flex flex-col rounded-full px-4 py-2 text-center transition sm:py-3 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-soft shadow-brand-primary/40'
                      : 'text-neutral-500 hover:bg-white'
                  }`}
                >
                  <span className="text-sm font-semibold">{tab.label}</span>
                  <span className="text-xs font-medium text-white/80 sm:text-[0.7rem]">
                    {isActive ? tab.description : String.fromCharCode(160)}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <section className="space-y-6" role="tabpanel">
          {activeTabIdentifier === 'extracted-text' && (
            <div className="surface-card px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-semibold text-neutral-900">Extracted Text Draft</h2>
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                  Edit and confirm
                </span>
              </div>
              <textarea
                value={extractedTextDraft}
                onChange={handleTextareaChange}
                className="mt-4 h-[420px] w-full resize-none rounded-2xl border border-white/60 bg-white/50 p-4 font-mono text-sm text-neutral-800 shadow-inset focus:border-brand-primary focus:outline-none"
                placeholder="OCR output will appear here for confirmation."
              />
            </div>
          )}

          {activeTabIdentifier === 'structured-recipe' && (
            <div className="surface-card space-y-6 px-4 py-6 sm:px-8">
              {parsedRecipeDraft ? (
                <Fragment>
                  <header className="space-y-1 border-b border-white/60 pb-4">
                    <h3 className="font-display text-2xl font-semibold text-neutral-900">
                      {parsedRecipeDraft.title || 'Untitled recipe'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Servings: {parsedRecipeDraft.originalServings ?? 'Unknown'} - Last updated{' '}
                      {new Date(parsedRecipeDraft.createdAt).toLocaleString()}
                    </p>
                  </header>
                  <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Ingredients</h4>
                      <ul className="mt-3 space-y-3 text-sm text-neutral-800">
                        {parsedRecipeDraft.ingredients.map((ingredient) => (
                          <li key={`${ingredient.ingredient}-${ingredient.raw}`} className="flex items-start gap-3">
                            <span className="mt-0.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                              {formatQuantity(ingredient.quantity)}{' '}
                              {ingredient.unit ?? ''}
                            </span>
                            <div>
                              <p className="font-medium text-neutral-900">{ingredient.ingredient}</p>
                              {ingredient.note ? (
                                <p className="text-xs text-neutral-500">{ingredient.note}</p>
                              ) : null}
                              <p className="text-[0.7rem] text-neutral-400">{ingredient.raw}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </article>
                    <article className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Instructions</h4>
                      <ol className="mt-3 space-y-3 text-sm text-neutral-800">
                        {parsedRecipeDraft.instructions.map((instruction, index) => (
                          <li key={`${instruction}-${index}`} className="rounded-xl bg-white/80 p-4 shadow-inset">
                            <span className="mr-2 rounded-full bg-brand-accent/20 px-3 py-1 text-xs font-semibold text-brand-accent">
                              Step {index + 1}
                            </span>
                            <p className="mt-2 text-neutral-800">{instruction}</p>
                          </li>
                        ))}
                      </ol>
                    </article>
                  </section>
                </Fragment>
              ) : (
                <div className="grid place-items-center rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-12 text-center text-sm text-neutral-500">
                  Structured results will appear here after parsing. Run the OCR flow to populate this view.
                </div>
              )}
            </div>
          )}

          {activeTabIdentifier === 'xr-preview' && (
            <div className="surface-card overflow-hidden px-6 py-8">
              <div className="rounded-2xl bg-gradient-to-br from-brand-primary/15 via-white to-brand-secondary/10 p-6 shadow-soft">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl space-y-3">
                    <h3 className="font-display text-2xl font-semibold text-neutral-900">XR Recipe Board Preview</h3>
                    <p className="text-sm text-neutral-600">
                      Visualize the hands-free cooking board you will see in supported headsets and Safari AR. Toggle
                      steps, voice commands, and timers from this control surface.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="pill-button bg-white/70 text-neutral-700">Next Gesture: Pinch or Tap</span>
                      <span className="pill-button bg-brand-secondary/20 text-brand-secondary">
                        Voice: "Start eight minute timer"
                      </span>
                    </div>
                  </div>
                  <div className="grid w-full max-w-sm gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-soft">
                    <div className="rounded-xl bg-brand-primary/10 p-4 text-sm text-brand-primary">
                      <p className="font-semibold">Step 2 - Mise en place</p>
                      <p className="mt-2 text-brand-primary/80">Gather onions, garlic, and herbs.</p>
                    </div>
                    <div className="rounded-xl bg-brand-accent/10 p-4 text-sm text-brand-accent">
                      <p className="font-semibold">Timer</p>
                      <p className="mt-2 text-brand-accent/80">08:00 remaining - tap to pause</p>
                    </div>
                    <div className="rounded-xl bg-brand-secondary/10 p-4 text-sm text-brand-secondary">
                      <p className="font-semibold">Servings Sync</p>
                      <p className="mt-2 text-brand-secondary/80">Linked to recipe workspace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
