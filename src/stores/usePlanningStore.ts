/**
 * Planning Store
 * 
 * Zustand store for managing project planning state.
 */

import { create } from 'zustand';
import { ProjectPlan, PlanningResult } from '@core/planning';

interface PlanningStore {
  // Current plan
  currentPlan: ProjectPlan | null;
  
  // Planning state
  isPlanning: boolean;
  planningError: string | null;
  
  // Planning result
  warnings: string[];
  suggestions: string[];
  
  // History
  planHistory: ProjectPlan[];
  
  // Actions
  setCurrentPlan: (plan: ProjectPlan | null) => void;
  setIsPlanning: (isPlanning: boolean) => void;
  setPlanningError: (error: string | null) => void;
  setPlanningResult: (result: PlanningResult) => void;
  
  addToHistory: (plan: ProjectPlan) => void;
  clearHistory: () => void;
  
  reset: () => void;
}

export const usePlanningStore = create<PlanningStore>((set) => ({
  // Initial state
  currentPlan: null,
  isPlanning: false,
  planningError: null,
  warnings: [],
  suggestions: [],
  planHistory: [],
  
  // Actions
  setCurrentPlan: (plan) => 
    set({ currentPlan: plan }),
  
  setIsPlanning: (isPlanning) => 
    set({ isPlanning }),
  
  setPlanningError: (error) => 
    set({ planningError: error }),
  
  setPlanningResult: (result) =>
    set({
      currentPlan: result.plan,
      warnings: result.warnings,
      suggestions: result.suggestions
    }),
  
  addToHistory: (plan) =>
    set((state) => ({
      planHistory: [...state.planHistory, plan]
    })),
  
  clearHistory: () => 
    set({ planHistory: [] }),
  
  reset: () =>
    set({
      currentPlan: null,
      isPlanning: false,
      planningError: null,
      warnings: [],
      suggestions: [],
      planHistory: []
    })
}));

// Made with Bob