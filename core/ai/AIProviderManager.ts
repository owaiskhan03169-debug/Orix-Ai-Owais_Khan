/**
 * AI Provider Manager
 * Manages AI provider instances and configuration
 */

import { ProviderFactory } from './ProviderFactory';
import { AIProvider } from './types';
import { ProviderType } from './types';

export interface ProviderManagerConfig {
  type: ProviderType;
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
}

export class AIProviderManager {
  private currentProvider: AIProvider | null = null;
  private currentType: ProviderType | null = null;

  /**
   * Set the active AI provider
   */
  setProvider(config: ProviderManagerConfig): void {
    try {
      this.currentProvider = ProviderFactory.createProvider(config.type);
      this.currentType = config.type;
    } catch (error) {
      console.error('Failed to set provider:', error);
      throw error;
    }
  }

  /**
   * Get the current active provider
   */
  getCurrentProvider(): AIProvider | null {
    return this.currentProvider;
  }

  /**
   * Check if a provider is active
   */
  hasActiveProvider(): boolean {
    return this.currentProvider !== null;
  }

  /**
   * Get current provider type
   */
  getCurrentProviderType(): ProviderType | null {
    return this.currentType;
  }

  /**
   * Clear current provider
   */
  clearProvider(): void {
    this.currentProvider = null;
    this.currentType = null;
  }
}

// Made with Bob
