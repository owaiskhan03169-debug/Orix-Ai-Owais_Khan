/**
 * Terminal Store
 * 
 * Zustand store for managing terminal state.
 */

import { create } from 'zustand';
import { TerminalLine, ProcessInfo, TerminalSession } from '../../services/terminal';

interface TerminalStore {
  // Current session
  currentSession: TerminalSession | null;
  
  // Active processes
  activeProcesses: ProcessInfo[];
  
  // Terminal output
  output: TerminalLine[];
  
  // Actions
  setCurrentSession: (session: TerminalSession | null) => void;
  addProcess: (process: ProcessInfo) => void;
  updateProcess: (processId: string, updates: Partial<ProcessInfo>) => void;
  removeProcess: (processId: string) => void;
  
  addOutput: (line: TerminalLine) => void;
  clearOutput: () => void;
  
  reset: () => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  // Initial state
  currentSession: null,
  activeProcesses: [],
  output: [],
  
  // Actions
  setCurrentSession: (session) => 
    set({ currentSession: session }),
  
  addProcess: (process) =>
    set((state) => ({
      activeProcesses: [...state.activeProcesses, process]
    })),
  
  updateProcess: (processId, updates) =>
    set((state) => ({
      activeProcesses: state.activeProcesses.map(p =>
        p.id === processId ? { ...p, ...updates } : p
      )
    })),
  
  removeProcess: (processId) =>
    set((state) => ({
      activeProcesses: state.activeProcesses.filter(p => p.id !== processId)
    })),
  
  addOutput: (line) =>
    set((state) => ({
      output: [...state.output, line]
    })),
  
  clearOutput: () => 
    set({ output: [] }),
  
  reset: () =>
    set({
      currentSession: null,
      activeProcesses: [],
      output: []
    })
}));

// Made with Bob