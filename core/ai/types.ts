/**
 * AI Provider Types and Interfaces
 * 
 * This file defines the core types and interfaces for the AI provider system.
 * All AI providers must implement the AIProvider interface.
 */

/**
 * Supported AI provider types
 */
export type ProviderType = 'mock' | 'openai' | 'claude' | 'watsonx' | 'ollama';

/**
 * Provider status
 */
export type ProviderStatus = 'idle' | 'initializing' | 'ready' | 'error';

/**
 * Configuration for AI providers
 */
export interface ProviderConfig {
  /** API key for the provider (if required) */
  apiKey?: string;
  
  /** Base URL for API endpoint */
  baseURL?: string;
  
  /** Model to use */
  model?: string;
  
  /** Temperature (0-1) for randomness */
  temperature?: number;
  
  /** Maximum tokens to generate */
  maxTokens?: number;
  
  /** Top P sampling */
  topP?: number;
  
  /** Frequency penalty */
  frequencyPenalty?: number;
  
  /** Presence penalty */
  presencePenalty?: number;
  
  /** Custom headers */
  headers?: Record<string, string>;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Additional provider-specific options */
  options?: Record<string, any>;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  /** Supports code generation */
  codeGeneration: boolean;
  
  /** Supports code analysis */
  codeAnalysis: boolean;
  
  /** Supports streaming responses */
  streaming: boolean;
  
  /** Supports function calling */
  functionCalling: boolean;
  
  /** Maximum context length in tokens */
  maxContextLength: number;
  
  /** Supported programming languages */
  supportedLanguages: string[];
  
  /** Supports image input */
  imageInput?: boolean;
  
  /** Supports embeddings */
  embeddings?: boolean;
}

/**
 * Code generation context
 */
export interface CodeContext {
  /** Programming language */
  language: string;
  
  /** Framework (if applicable) */
  framework?: string;
  
  /** Existing code for context */
  existingCode?: string;
  
  /** Project dependencies */
  dependencies?: string[];
  
  /** Project type */
  projectType?: string;
  
  /** File path (for context) */
  filePath?: string;
  
  /** Additional instructions */
  instructions?: string;
}

/**
 * Generated file structure
 */
export interface GeneratedFile {
  /** File path relative to project root */
  path: string;
  
  /** File content */
  content: string;
  
  /** File type/extension */
  type: string;
  
  /** Description of file purpose */
  description?: string;
}

/**
 * Code generation response
 */
export interface CodeResponse {
  /** Generated code */
  code: string;
  
  /** Explanation of the code */
  explanation?: string;
  
  /** Multiple files (if applicable) */
  files?: GeneratedFile[];
  
  /** Required dependencies */
  dependencies?: string[];
  
  /** Suggested next steps */
  nextSteps?: string[];
  
  /** Warnings or notes */
  warnings?: string[];
}

/**
 * Code analysis result
 */
export interface AnalysisResult {
  /** Overall quality score (0-100) */
  qualityScore: number;
  
  /** Detected issues */
  issues: Issue[];
  
  /** Improvement suggestions */
  suggestions: string[];
  
  /** Code complexity metrics */
  complexity?: number;
}

/**
 * Code issue
 */
export interface Issue {
  /** Issue severity */
  severity: 'error' | 'warning' | 'info';
  
  /** Issue message */
  message: string;
  
  /** Line number (if applicable) */
  line?: number;
  
  /** Column number (if applicable) */
  column?: number;
  
  /** Suggested fix */
  fix?: string;
}

/**
 * Provider metadata
 */
export interface ProviderMetadata {
  /** Provider name */
  name: string;
  
  /** Provider display name */
  displayName: string;
  
  /** Provider description */
  description: string;
  
  /** Provider version */
  version: string;
  
  /** Provider icon/logo */
  icon?: string;
  
  /** Requires API key */
  requiresApiKey: boolean;
  
  /** Is local provider (no API calls) */
  isLocal: boolean;
  
  /** Provider website */
  website?: string;
  
  /** Documentation URL */
  docsUrl?: string;
}

/**
 * Base AI Provider interface
 * All AI providers must implement this interface
 */
export interface AIProvider {
  /** Provider metadata */
  readonly metadata: ProviderMetadata;
  
  /** Provider capabilities */
  readonly capabilities: ProviderCapabilities;
  
  /** Current provider status */
  readonly status: ProviderStatus;
  
  /**
   * Initialize the provider with configuration
   * @param config Provider configuration
   * @throws Error if initialization fails
   */
  initialize(config: ProviderConfig): Promise<void>;
  
  /**
   * Generate code based on prompt and context
   * @param prompt User's code generation request
   * @param context Additional context
   * @returns Generated code with metadata
   */
  generateCode(prompt: string, context?: CodeContext): Promise<CodeResponse>;
  
  /**
   * Analyze existing code
   * @param code Code to analyze
   * @returns Analysis results
   */
  analyzeCode(code: string): Promise<AnalysisResult>;
  
  /**
   * Stream response for real-time feedback
   * @param prompt User's request
   * @yields Chunks of generated text
   */
  streamResponse(prompt: string): AsyncGenerator<string, void, unknown>;
  
  /**
   * Validate provider configuration
   * @returns true if config is valid
   */
  validateConfig(config: ProviderConfig): boolean;
  
  /**
   * Test provider connection
   * @returns true if connection is successful
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Cleanup resources
   */
  dispose(): Promise<void>;
}

/**
 * Provider error types
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ProviderInitializationError extends ProviderError {
  constructor(message: string, provider: string) {
    super(message, 'INITIALIZATION_ERROR', provider);
    this.name = 'ProviderInitializationError';
  }
}

export class ProviderConnectionError extends ProviderError {
  constructor(message: string, provider: string) {
    super(message, 'CONNECTION_ERROR', provider);
    this.name = 'ProviderConnectionError';
  }
}

export class ProviderConfigurationError extends ProviderError {
  constructor(message: string, provider: string) {
    super(message, 'CONFIGURATION_ERROR', provider);
    this.name = 'ProviderConfigurationError';
  }
}

// Made with Bob
