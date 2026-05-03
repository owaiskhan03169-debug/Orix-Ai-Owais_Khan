/**
 * Understanding Store
 * 
 * Zustand store for managing prompt understanding state.
 */

import { create } from 'zustand';
import { PromptUnderstanding } from '@core/understanding';

interface UnderstandingStore {
  // Current understanding
  currentUnderstanding: PromptUnderstanding | null;
  
  // Analysis state
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // History
  understandingHistory: PromptUnderstanding[];
  
  // Actions
  setCurrentUnderstanding: (understanding: PromptUnderstanding | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  
  addToHistory: (understanding: PromptUnderstanding) => void;
  clearHistory: () => void;
  
  reset: () => void;
}

export const useUnderstandingStore = create<UnderstandingStore>((set) => ({
  // Initial state
  currentUnderstanding: null,
  isAnalyzing: false,
  analysisError: null,
  understandingHistory: [],
  
  // Actions
  setCurrentUnderstanding: (understanding) => 
    set({ currentUnderstanding: understanding }),
  
  setIsAnalyzing: (isAnalyzing) => 
    set({ isAnalyzing }),
  
  setAnalysisError: (error) => 
    set({ analysisError: error }),
  
  addToHistory: (understanding) =>
    set((state) => ({
      understandingHistory: [...state.understandingHistory, understanding]
    })),
  
  clearHistory: () => 
    set({ understandingHistory: [] }),
  
  reset: () =>
    set({
      currentUnderstanding: null,
      isAnalyzing: false,
      analysisError: null,
      understandingHistory: []
    })
}));

// Made with Bob