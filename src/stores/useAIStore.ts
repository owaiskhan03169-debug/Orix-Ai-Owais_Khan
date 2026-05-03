import { create } from 'zustand';
import { ProviderType } from '@core/ai';

interface AIStore {
  apiKey: string;
  setApiKey: (key: string) => void;
  currentProvider: ProviderType;
  setProvider: (provider: ProviderType) => void;
  setCurrentProvider: (provider: ProviderType) => void;
}

const storedProvider = localStorage.getItem('orix_provider') as ProviderType | null;

export const useAIStore = create<AIStore>((set) => ({
  apiKey: localStorage.getItem('orix_openai_key') || '',
  setApiKey: (key: string) => {
    localStorage.setItem('orix_openai_key', key);
    set({ apiKey: key });
  },
  currentProvider: storedProvider || 'ollama',
  setProvider: (provider: ProviderType) => {
    localStorage.setItem('orix_provider', provider);
    set({ currentProvider: provider });
  },
  setCurrentProvider: (provider: ProviderType) => {
    localStorage.setItem('orix_provider', provider);
    set({ currentProvider: provider });
  }
}));
