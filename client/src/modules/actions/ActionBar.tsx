import { ChangeEvent, useRef, useState } from 'react';
import { useRecipeWorkspaceStore } from '@/state/recipeWorkspaceStore';
import { requestOcrImage, requestParseLines, requestValidateRecipe } from '../actions/apiClient';
import type { ParsedRecipe } from '@xr/shared';

const primaryButtonClasses =
  'pill-button bg-brand-primary text-white shadow-soft shadow-brand-primary/40 hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed';
const secondaryButtonClasses =
  'pill-button bg-white/60 text-neutral-900 border border-white/70 hover:bg-white/80 disabled:opacity-60 disabled:cursor-not-allowed';
const tertiaryButtonClasses =
  'pill-button bg-white/40 text-neutral-700 border border-white/60 hover:bg-white/60 disabled:opacity-60 disabled:cursor-not-allowed';

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unexpected file reader result'));
      }
    };
    reader.readAsDataURL(file);
  });
};

export const ActionBar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const extractedTextDraft = useRecipeWorkspaceStore((state) => state.extractedTextDraft);
  const isProcessing = useRecipeWorkspaceStore((state) => state.isProcessing);
  const setProcessingState = useRecipeWorkspaceStore((state) => state.setProcessing);
  const setExtractedTextDraft = useRecipeWorkspaceStore((state) => state.setExtractedTextDraft);
  const setParsedRecipeDraft = useRecipeWorkspaceStore((state) => state.setParsedRecipeDraft);
  const setWarnings = useRecipeWorkspaceStore((state) => state.setWarnings);
  const setServings = useRecipeWorkspaceStore((state) => state.setServings);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const runParserPipeline = async (lines: string[]) => {
    const parseResponse = await requestParseLines({ lines });
    let workingRecipe: ParsedRecipe = parseResponse.recipe;
    let combinedWarnings = parseResponse.warnings;

    try {
      const validationResponse = await requestValidateRecipe(parseResponse.recipe);
      workingRecipe = validationResponse.recipe;
      combinedWarnings = validationResponse.warnings;
    } catch (validationError) {
      console.warn('Validation failed; continuing with parser warnings.', validationError);
    }

    const currentTargetServings = useRecipeWorkspaceStore.getState().targetServings;

    setParsedRecipeDraft(workingRecipe);
    setWarnings(combinedWarnings);
    setServings(workingRecipe.originalServings, currentTargetServings);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setProcessingState(true);
      const base64 = await readFileAsDataUrl(file);
      const ocrResult = await requestOcrImage({
        imageBase64: base64,
        mimeType: file.type,
        originalFileName: file.name
      });

      const textLines = (ocrResult.lines ?? []).map((line) => line.text).filter((line) => line.length > 0);
      const combinedText = textLines.join('\n');
      setExtractedTextDraft(combinedText);

      if (textLines.length > 0) {
        await runParserPipeline(textLines);
      }
    } catch (error) {
      console.error('Failed to process image for OCR', error);
    } finally {
      setProcessingState(false);
      event.target.value = '';
    }
  };

  const handleVoiceNoteToggle = () => {
    setIsRecordingVoiceNote((previousState) => !previousState);
  };

  const handlePasteText = async () => {
    if (!navigator.clipboard) {
      console.log('[ActionBar] Clipboard API unavailable');
      return;
    }

    try {
      setProcessingState(true);
      const clipboardText = await navigator.clipboard.readText();
      setExtractedTextDraft(clipboardText);

      const lines = clipboardText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length > 0) {
        await runParserPipeline(lines);
      }
    } catch (error) {
      console.error('Failed to parse clipboard contents', error);
    } finally {
      setProcessingState(false);
    }
  };

  const handleParseTextDraft = async () => {
    const lines = extractedTextDraft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      console.log('[ActionBar] No lines to parse');
      return;
    }

    try {
      setProcessingState(true);
      await runParserPipeline(lines);
    } catch (error) {
      console.error('Failed to run parser pipeline', error);
    } finally {
      setProcessingState(false);
    }
  };

  return (
    <header className="glass-surface mx-auto mt-8 w-full max-w-6xl px-6 py-6 lg:px-10 lg:py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-primary/70">XR Kitchen Suite</p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-neutral-900 lg:text-4xl">
            Capture, refine, and cook recipes the deterministic way.
          </h1>
          <p className="max-w-2xl text-sm text-neutral-600 lg:text-base">
            Import handwritten cards, paste drafts, and confirm structured steps with a predictable workspace tailored
            for kitchens of every size.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" className={primaryButtonClasses} onClick={handleImageUploadClick} disabled={isProcessing}>
            Scan or Upload Recipe
          </button>
          <button
            type="button"
            className={`${secondaryButtonClasses} ${isRecordingVoiceNote ? 'bg-brand-accent/20 text-brand-accent' : ''}`}
            onClick={handleVoiceNoteToggle}
            disabled={isProcessing}
          >
            {isRecordingVoiceNote ? 'Stop Voice Dictation' : 'Record Voice Note'}
          </button>
          <button type="button" className={tertiaryButtonClasses} onClick={handlePasteText} disabled={isProcessing}>
            Paste & Parse Clipboard
          </button>
          <button type="button" className={tertiaryButtonClasses} onClick={handleParseTextDraft} disabled={isProcessing}>
            Parse Current Draft
          </button>
        </div>
      </div>
    </header>
  );
};
