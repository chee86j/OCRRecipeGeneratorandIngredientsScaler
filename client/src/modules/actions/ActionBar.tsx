import { useState } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';

const primaryButtonClasses =
  'pill-button bg-brand-primary text-white shadow-soft shadow-brand-primary/40 hover:bg-brand-primary/90';
const secondaryButtonClasses =
  'pill-button bg-white/60 text-neutral-900 border border-white/70 hover:bg-white/80';
const tertiaryButtonClasses =
  'pill-button bg-white/40 text-neutral-700 border border-white/60 hover:bg-white/60';

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
    <header className="glass-surface mx-auto mt-8 w-full max-w-6xl px-6 py-6 lg:px-10 lg:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-primary/70">XR Kitchen Suite</p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-neutral-900 lg:text-4xl">
            Capture, refine, and cook recipes the Apple way.
          </h1>
          <p className="max-w-2xl text-sm text-neutral-600 lg:text-base">
            Import handwritten cards, narrate new ideas, and confirm structured steps with a fluid, iOS-inspired
            workspace tailored for kitchens of every size.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" className={primaryButtonClasses} onClick={handleImageUploadClick}>
            Scan or Upload Recipe
          </button>
          <button
            type="button"
            className={`${secondaryButtonClasses} ${
              isRecordingVoiceNote ? 'bg-brand-accent/20 text-brand-accent' : ''
            }`}
            onClick={handleVoiceNoteToggle}
          >
            {isRecordingVoiceNote ? 'Stop Voice Dictation' : 'Record Voice Note'}
          </button>
          <button type="button" className={tertiaryButtonClasses} onClick={handlePasteText}>
            Paste Draft Text
          </button>
        </div>
      </div>
    </header>
  );
};
