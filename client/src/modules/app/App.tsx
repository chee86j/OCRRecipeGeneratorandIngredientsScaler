import { useState } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';
import { ActionBar } from '../actions/ActionBar';
import { RecipeTabs } from '../tabs/RecipeTabs';
import { WarningsPanel } from '../warnings/WarningsPanel';
import { AppFooter } from '../layout/AppFooter';

type RecipeTabIdentifier = 'extracted-text' | 'structured-recipe' | 'xr-preview';

const loadingIndicatorClasses =
  'absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm';

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
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <ActionBar />
      <div className="flex flex-1 overflow-hidden">
        <RecipeTabs
          activeTabIdentifier={activeTabIdentifier}
          onTabChange={handleTabChange}
          extractedTextDraft={extractedTextDraft}
          onExtractedTextChange={handleExtractedTextChange}
          parsedRecipeDraft={parsedRecipeDraft}
        />
        <WarningsPanel />
      </div>
      <AppFooter />

      {isProcessing ? (
        <div className={loadingIndicatorClasses}>
          <div className={loadingSpinnerClasses} aria-hidden="true" />
          <p className="ml-4 text-sm text-slate-300">Processing...
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default App;
