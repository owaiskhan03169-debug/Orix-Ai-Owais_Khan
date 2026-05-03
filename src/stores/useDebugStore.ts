/**
 * Debug Store
 * Manages debugging state and sessions
 */

import { create } from 'zustand';
import { DebugSession, ErrorInfo, FixAttempt } from '../../core/debugging/types';

interface DebugState {
  // Sessions
  sessions: DebugSession[];
  activeSessionId: string | null;

  // Actions
  addSession: (session: DebugSession) => void;
  updateSession: (sessionId: string, updates: Partial<DebugSession>) => void;
  setActiveSession: (sessionId: string | null) => void;
  removeSession: (sessionId: string) => void;
  clearSessions: () => void;

  // Error management
  addError: (sessionId: string, error: ErrorInfo) => void;
  addFixAttempt: (sessionId: string, attempt: FixAttempt) => void;

  // Getters
  getSession: (sessionId: string) => DebugSession | undefined;
  getActiveSession: () => DebugSession | undefined;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  // Initial state
  sessions: [],
  activeSessionId: null,

  // Actions
  addSession: (session) => {
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id
    }));
  },

  updateSession: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    }));
  },

  setActiveSession: (sessionId) => {
    set({ activeSessionId: sessionId });
  },

  removeSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId
    }));
  },

  clearSessions: () => {
    set({ sessions: [], activeSessionId: null });
  },

  addError: (sessionId, error) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, errors: [...session.errors, error] }
          : session
      )
    }));
  },

  addFixAttempt: (sessionId, attempt) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, fixes: [...session.fixes, attempt] }
          : session
      )
    }));
  },

  // Getters
  getSession: (sessionId) => {
    return get().sessions.find((s) => s.id === sessionId);
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId);
  }
}));

// Made with Bob
