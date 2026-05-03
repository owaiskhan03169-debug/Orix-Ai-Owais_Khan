/**
 * AI Provider Manager
 * 
 * Manages the active AI provider and handles provider switching.
 * Singleton pattern ensures only one active provider at a time.
 */

import { AIProvider, ProviderType, ProviderConfig, ProviderError } from './types';
import { ProviderFactory } from './ProviderFactory';

export class ProviderManager {
  private static instance: ProviderManager;
  private currentProvider: AIProvider | null = null;
  private currentProviderType: ProviderType | null = null;
  private providerConfig: Map<ProviderType, ProviderConfig> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  /**
   * Initialize and switch to a provider
   * @param type Provider type
   * @param config Provider configuration
   */
  async switchProvider(type: ProviderType, config: ProviderConfig): Promise<void> {
    try {
      // Dispose current provider if exists
      if (this.currentProvider) {
        await this.currentProvider.dispose();
      }

      // Create new provider
      const provider = ProviderFactory.createProvider(type, config);

      // Initialize provider
      await provider.initialize(config);

      // Set as current provider
      this.currentProvider = provider;
      this.currentProviderType = type;

      // Store configuration
      this.providerConfig.set(type, config);

      console.log(`Switched to provider: ${type}`);
    } catch (error) {
      console.error(`Failed to switch to provider ${type}:`, error);
      throw error;
    }
  }

  /**
   * Get the current active provider
   * @throws Error if no provider is active
   */
  getCurrentProvider(): AIProvider {
    if (!this.currentProvider) {
      throw new Error('No active provider. Please initialize a provider first.');
    }
    return this.currentProvider;
  }

  /**
   * Get the current provider type
   */
  getCurrentProviderType(): ProviderType | null {
    return this.currentProviderType;
  }

  /**
   * Check if a provider is currently active
   */
  hasActiveProvider(): boolean {
    return this.currentProvider !== null;
  }

  /**
   * Get stored configuration for a provider
   * @param type Provider type
   */
  getProviderConfig(type: ProviderType): ProviderConfig | undefined {
    return this.providerConfig.get(type);
  }

  /**
   * Store configuration for a provider without switching
   * @param type Provider type
   * @param config Provider configuration
   */
  setProviderConfig(type: ProviderType, config: ProviderConfig): void {
    this.providerConfig.set(type, config);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): ProviderType[] {
    return ProviderFactory.getAvailableProviders();
  }

  /**
   * Get metadata for a provider
   * @param type Provider type
   */
  getProviderMetadata(type: ProviderType) {
    return ProviderFactory.getProviderMetadata(type);
  }

  /**
   * Get capabilities for a provider
   * @param type Provider type
   */
  getProviderCapabilities(type: ProviderType) {
    return ProviderFactory.getProviderCapabilities(type);
  }

  /**
   * Test connection for a provider
   * @param type Provider type
   * @param config Provider configuration
   */
  async testProviderConnection(
    type: ProviderType,
    config: ProviderConfig
  ): Promise<boolean> {
    try {
      const provider = ProviderFactory.createProvider(type, config);
      await provider.initialize(config);
      const result = await provider.testConnection();
      await provider.dispose();
      return result;
    } catch (error) {
      console.error(`Connection test failed for ${type}:`, error);
      return false;
    }
  }

  /**
   * Dispose the current provider
   */
  async dispose(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.dispose();
      this.currentProvider = null;
      this.currentProviderType = null;
    }
  }

  /**
   * Reset the manager (for testing)
   */
  reset(): void {
    this.currentProvider = null;
    this.currentProviderType = null;
    this.providerConfig.clear();
  }
}

// Export singleton instance
export const providerManager = ProviderManager.getInstance();

// Made with Bob
