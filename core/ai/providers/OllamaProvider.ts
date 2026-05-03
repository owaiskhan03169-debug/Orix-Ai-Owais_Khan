/**
 * Ollama Provider
 *
 * Provider implementation for local Ollama models.
 */

import { BaseProvider } from '../BaseProvider';
import {
  ProviderMetadata,
  ProviderCapabilities,
  ProviderConfig,
  CodeContext,
  CodeResponse,
  AnalysisResult,
  ProviderConnectionError,
  ProviderInitializationError
} from '../types';

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

interface OllamaStreamChunk {
  message?: {
    content?: string;
  };
  error?: string;
}

export class OllamaProvider extends BaseProvider {
  readonly metadata: ProviderMetadata = {
    name: 'ollama',
    displayName: 'Ollama (Local)',
    description: 'Run LLMs locally with Ollama',
    version: '1.0.0',
    requiresApiKey: false,
    isLocal: true,
    icon: 'O',
    website: 'https://ollama.com',
    docsUrl: 'https://github.com/ollama/ollama'
  };

  readonly capabilities: ProviderCapabilities = {
    codeGeneration: true,
    codeAnalysis: true,
    streaming: true,
    functionCalling: false,
    maxContextLength: 8192,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp']
  };

  private baseURL = 'http://localhost:11434';
  private model = 'qwen2.5-coder:7b';
  private timeout = 5 * 60 * 1000;

  protected async onInitialize(config: ProviderConfig): Promise<void> {
    this.baseURL = config.baseURL || this.baseURL;
    this.model = config.model || this.model;
    this.timeout = config.timeout || this.timeout;

    const isRunning = await this.checkOllamaStatus();
    if (!isRunning) {
      throw new ProviderInitializationError(
        `Ollama is not reachable at ${this.baseURL}. Start Ollama and try again.`,
        this.metadata.name
      );
    }

    const hasModel = await this.checkModelAvailable();
    if (!hasModel) {
      throw new ProviderInitializationError(
        `Model "${this.model}" is not installed. Run: ollama pull ${this.model}`,
        this.metadata.name
      );
    }
  }

  async generateCode(prompt: string, context?: CodeContext): Promise<CodeResponse> {
    try {
      const response = await this.chat(
        `Generate production-ready code for the request below.
Language: ${context?.language || 'typescript'}
Framework: ${context?.framework || 'not specified'}
Existing code:
${context?.existingCode || 'none'}

Request:
${prompt}`
      );

      return {
        code: response,
        dependencies: context?.dependencies || []
      };
    } catch (error) {
      throw new ProviderConnectionError(
        `Failed to generate code: ${error instanceof Error ? error.message : String(error)}`,
        this.metadata.name
      );
    }
  }

  async analyzeCode(code: string): Promise<AnalysisResult> {
    try {
      const response = await this.chat(
        `Analyze this code. Return concise findings grouped by errors, warnings, suggestions, and a quality score from 0 to 100.

${code}`
      );

      return {
        qualityScore: this.extractScore(response),
        issues: [
          {
            severity: 'info',
            message: response
          }
        ],
        suggestions: [],
        complexity: undefined
      };
    } catch (error) {
      throw new ProviderConnectionError(
        `Failed to analyze code: ${error instanceof Error ? error.message : String(error)}`,
        this.metadata.name
      );
    }
  }

  async *streamResponse(prompt: string): AsyncGenerator<string, void, unknown> {
    const response = await this.fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok || !response.body) {
      throw new ProviderConnectionError(
        `Ollama stream failed: ${response.status} ${response.statusText}`,
        this.metadata.name
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }

        const chunk = JSON.parse(trimmed) as OllamaStreamChunk;
        if (chunk.error) {
          throw new ProviderConnectionError(chunk.error, this.metadata.name);
        }

        const token = chunk.message?.content;
        if (token) {
          yield token;
        }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    return this.checkOllamaStatus();
  }

  protected getDefaultModel(): string {
    return 'qwen2.5-coder:7b';
  }

  private async chat(prompt: string): Promise<string> {
    const response = await this.fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [{ role: 'user', content: prompt }],
        options: {
          temperature: 0.2,
          num_ctx: 8192
        }
      })
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaChatResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    return data.message?.content || '';
  }

  private async checkOllamaStatus(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout('/api/tags', { method: 'GET' }, 8000);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkModelAvailable(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout('/api/tags', { method: 'GET' }, 8000);
      if (!response.ok) {
        return false;
      }

      const data = await response.json() as { models?: Array<{ name?: string }> };
      return Boolean(data.models?.some((entry) => entry.name === this.model));
    } catch {
      return false;
    }
  }

  private extractScore(response: string): number {
    const match = response.match(/(?:score|quality)[^\d]*(\d{1,3})/i);
    if (!match) {
      return 0;
    }

    return Math.max(0, Math.min(100, Number(match[1])));
  }

  private fetchWithTimeout(pathname: string, init: RequestInit, timeout = this.timeout): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    return fetch(`${this.baseURL}${pathname}`, {
      ...init,
      signal: controller.signal
    }).finally(() => clearTimeout(timer));
  }
}
