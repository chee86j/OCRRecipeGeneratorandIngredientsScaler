import { useState } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';
import { ActionBar } from '../actions/ActionBar';
import { RecipeTabs } from '../tabs/RecipeTabs';
import { WarningsPanel } from '../warnings/WarningsPanel';
import { AppFooter } from '../layout/AppFooter';

type RecipeTabIdentifier = 'extracted-text' | 'structured-recipe' | 'xr-preview';

const loadingIndicatorClasses =
  'absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm';

const loadingSpinnerClasses =
  'h-12 w-12 animate-spin rounded-full border-2 border-brand-primary border-t-transparent';

const App = () => {
  const [activeTabIdentifier, setActiveTabIdentifier] = useState<RecipeTabIdentifier>('extracted-text');
  const extractedTextDraft = useRecipeWorkspaceStore((state) => state.extractedTextDraft);
  const setExtractedTextDraft = useRecipeWorkspaceStore((state) => state.setExtractedTextDraft);
  const parsedRecipeDraft = useRecipeWorkspaceStore((state) => state.parsedRecipeDraft);
  const isProcessing = useRecipeWorkspaceStore((state) => state.isProcessing);

  const handleTabChange = (nextTabIdentifier: RecipeTabIdentifier) => {
    console.log('[App Placeholder] Switching workspace tab', { nextTabIdentifier });
    setActiveTabIdentifier(nextTabIdentifier);
  };

  const handleExtractedTextChange = (nextDraft: string) => {
    console.log('[App Placeholder] Updated extracted text draft');
    setExtractedTextDraft(nextDraft);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <ActionBar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-10">
        <RecipeTabs
          activeTabIdentifier={activeTabIdentifier}
          onTabChange={handleTabChange}
          extractedTextDraft={extractedTextDraft}
          onExtractedTextChange={handleExtractedTextChange}
          parsedRecipeDraft={parsedRecipeDraft}
        />
        <div className="hidden w-full max-w-xs lg:block lg:sticky lg:top-24">
          <WarningsPanel />
        </div>
      </main>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:hidden">
        <WarningsPanel />
      </div>
      <AppFooter />

      {isProcessing ? (
        <div className={loadingIndicatorClasses}>
          <div className={loadingSpinnerClasses} aria-hidden="true" />
          <p className="ml-4 text-sm text-neutral-600">Processing...</p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
