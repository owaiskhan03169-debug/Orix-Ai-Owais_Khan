/**
 * AI Provider Factory
 * 
 * Factory for creating and managing AI provider instances.
 * Handles provider registration and instantiation.
 */

import { AIProvider, ProviderType, ProviderConfig } from './types';
import { MockProvider } from './providers/MockProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { WatsonxProvider } from './providers/WatsonxProvider';
import { OllamaProvider } from './providers/OllamaProvider';

/**
 * Provider registry mapping provider types to their classes
 */
const PROVIDER_REGISTRY = {
  mock: MockProvider,
  openai: OpenAIProvider,
  claude: ClaudeProvider,
  watsonx: WatsonxProvider,
  ollama: OllamaProvider,
} as const;

/**
 * Provider Factory
 * Creates provider instances based on type
 */
export class ProviderFactory {
  /**
   * Create a provider instance
   * @param type Provider type
   * @param config Provider configuration
   * @returns Provider instance
   */
  static createProvider(type: ProviderType, config?: ProviderConfig): AIProvider {
    const ProviderClass = PROVIDER_REGISTRY[type];
    
    if (!ProviderClass) {
      throw new Error(`Unknown provider type: ${type}`);
    }
    
    return new ProviderClass();
  }

  /**
   * Get all available provider types
   * @returns Array of provider types
   */
  static getAvailableProviders(): ProviderType[] {
    return Object.keys(PROVIDER_REGISTRY) as ProviderType[];
  }

  /**
   * Check if a provider type is available
   * @param type Provider type to check
   * @returns true if provider is available
   */
  static isProviderAvailable(type: string): type is ProviderType {
    return type in PROVIDER_REGISTRY;
  }

  /**
   * Get provider metadata without instantiating
   * @param type Provider type
   * @returns Provider metadata
   */
  static getProviderMetadata(type: ProviderType) {
    const provider = this.createProvider(type);
    return provider.metadata;
  }

  /**
   * Get provider capabilities without instantiating
   * @param type Provider type
   * @returns Provider capabilities
   */
  static getProviderCapabilities(type: ProviderType) {
    const provider = this.createProvider(type);
    return provider.capabilities;
  }
}

// Made with Bob
