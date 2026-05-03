/**
 * Base AI Provider Implementation
 * 
 * This abstract class provides common functionality for all AI providers.
 * Concrete providers should extend this class and implement the abstract methods.
 */

import {
  AIProvider,
  ProviderConfig,
  ProviderStatus,
  ProviderMetadata,
  ProviderCapabilities,
  CodeContext,
  CodeResponse,
  AnalysisResult,
  ProviderConfigurationError,
} from './types';

export abstract class BaseProvider implements AIProvider {
  protected config: ProviderConfig = {};
  protected _status: ProviderStatus = 'idle';

  abstract readonly metadata: ProviderMetadata;
  abstract readonly capabilities: ProviderCapabilities;

  get status(): ProviderStatus {
    return this._status;
  }

  /**
   * Initialize the provider
   */
  async initialize(config: ProviderConfig): Promise<void> {
    this._status = 'initializing';
    
    try {
      // Validate configuration
      if (!this.validateConfig(config)) {
        throw new ProviderConfigurationError(
          'Invalid provider configuration',
          this.metadata.name
        );
      }

      this.config = { ...config };
      
      // Perform provider-specific initialization
      await this.onInitialize(config);
      
      this._status = 'ready';
    } catch (error) {
      this._status = 'error';
      throw error;
    }
  }

  /**
   * Provider-specific initialization logic
   * Override this in concrete providers
   */
  protected abstract onInitialize(config: ProviderConfig): Promise<void>;

  /**
   * Generate code
   */
  abstract generateCode(
    prompt: string,
    context?: CodeContext
  ): Promise<CodeResponse>;

  /**
   * Analyze code
   */
  abstract analyzeCode(code: string): Promise<AnalysisResult>;

  /**
   * Stream response
   */
  abstract streamResponse(prompt: string): AsyncGenerator<string, void, unknown>;

  /**
   * Validate configuration
   */
  validateConfig(config: ProviderConfig): boolean {
    // Check if API key is required
    if (this.metadata.requiresApiKey && !config.apiKey) {
      return false;
    }

    // Check if model is specified
    if (!config.model && !this.getDefaultModel()) {
      return false;
    }

    // Validate temperature range
    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 1) {
        return false;
      }
    }

    // Validate maxTokens
    if (config.maxTokens !== undefined) {
      if (config.maxTokens < 1 || config.maxTokens > this.capabilities.maxContextLength) {
        return false;
      }
    }

    return true;
  }

  /**
   * Test provider connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple test: try to generate a minimal response
      const response = await this.generateCode('test', {
        language: 'javascript',
      });
      return !!response.code;
    } catch (error) {
      console.error(`Connection test failed for ${this.metadata.name}:`, error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    this._status = 'idle';
    this.config = {};
  }

  /**
   * Get default model for this provider
   * Override in concrete providers
   */
  protected getDefaultModel(): string | undefined {
    return undefined;
  }

  /**
   * Build system prompt for code generation
   */
  protected buildSystemPrompt(context?: CodeContext): string {
    let prompt = 'You are an expert software developer.';

    if (context?.language) {
      prompt += ` You specialize in ${context.language}.`;
    }

    if (context?.framework) {
      prompt += ` You are proficient with ${context.framework}.`;
    }

    prompt += ' Generate clean, production-ready code following best practices.';
    prompt += ' Include proper error handling, type safety, and documentation.';

    return prompt;
  }

  /**
   * Build user prompt with context
   */
  protected buildUserPrompt(prompt: string, context?: CodeContext): string {
    let userPrompt = prompt;

    if (context?.existingCode) {
      userPrompt += `\n\nExisting code:\n\`\`\`${context.language}\n${context.existingCode}\n\`\`\``;
    }

    if (context?.dependencies?.length) {
      userPrompt += `\n\nAvailable dependencies: ${context.dependencies.join(', ')}`;
    }

    if (context?.instructions) {
      userPrompt += `\n\nAdditional instructions: ${context.instructions}`;
    }

    return userPrompt;
  }

  /**
   * Parse code from response
   * Extracts code blocks from markdown-formatted responses
   */
  protected parseCodeFromResponse(response: string): string {
    // Try to extract code from markdown code blocks
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      // Return the first code block
      return matches[0][1].trim();
    }

    // If no code blocks found, return the entire response
    return response.trim();
  }

  /**
   * Get configuration value with fallback
   */
  protected getConfigValue<K extends keyof ProviderConfig>(
    key: K,
    defaultValue: ProviderConfig[K]
  ): ProviderConfig[K] {
    return this.config[key] ?? defaultValue;
  }
}

// Made with Bob
