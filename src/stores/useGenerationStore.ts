/**
 * Generation Store
 * 
 * Zustand store for managing code generation state.
 */

import { create } from 'zustand';
import { GenerationResult, GenerationProgress } from '@core/generation';

interface GenerationStore {
  // Current generation
  isGenerating: boolean;
  progress: GenerationProgress | null;
  result: GenerationResult | null;
  
  // Actions
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: GenerationProgress | null) => void;
  setResult: (result: GenerationResult | null) => void;
  
  reset: () => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  // Initial state
  isGenerating: false,
  progress: null,
  result: null,
  
  // Actions
  setIsGenerating: (isGenerating) => 
    set({ isGenerating }),
  
  setProgress: (progress) => 
    set({ progress }),
  
  setResult: (result) => 
    set({ result }),
  
  reset: () =>
    set({
      isGenerating: false,
      progress: null,
      result: null
    })
}));

// Made with Bob