import { useState } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

const actionButtonClasses =
  'rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

export const ActionBar = () => {
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const setProcessingState = useRecipeWorkspaceStore((state) => state.setProcessing);

  const handleImageUploadClick = () => {
    console.log('[ActionBar Placeholder] Triggered image upload flow');
    setProcessingState(true);
    setTimeout(() => {
      setProcessingState(false);
      console.log('[ActionBar Placeholder] Image upload flow complete');
    }, 500);
  };

  const handleVoiceNoteToggle = () => {
    console.log('[ActionBar Placeholder] Toggled voice recording state');
    setIsRecordingVoiceNote((previousState) => !previousState);
  };

  const handlePasteText = () => {
    if (!navigator.clipboard) {
      console.log('[ActionBar Placeholder] Clipboard API unavailable');
      return;
    }

    console.log('[ActionBar Placeholder] Attempting to read clipboard text');
    navigator.clipboard
      .readText()
      .then((clipboardText) => {
        useRecipeWorkspaceStore.getState().setExtractedTextDraft(clipboardText);
        console.log('[ActionBar Placeholder] Inserted clipboard contents into workspace');
      })
      .catch(() => {
        console.log('[ActionBar Placeholder] Failed to read clipboard contents');
      });
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">XR Recipe Generator</h1>
        <p className="text-sm text-slate-400">Digitize, validate, and scale recipes with OpenAI-powered OCR.</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={actionButtonClasses} onClick={handleImageUploadClick}>
          Scan / Upload Image
        </button>
        <button
          type="button"
          className={`${actionButtonClasses} ${
            isRecordingVoiceNote ? 'border-brand-accent text-brand-accent' : ''
          }`}
          onClick={handleVoiceNoteToggle}
        >
          {isRecordingVoiceNote ? 'Stop Voice Note' : 'Record Voice Note'}
        </button>
        <button type="button" className={actionButtonClasses} onClick={handlePasteText}>
          Paste Text
        </button>
      </div>
    </header>
  );
};
