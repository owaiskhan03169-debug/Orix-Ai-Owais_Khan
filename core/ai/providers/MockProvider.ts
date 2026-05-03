/**
 * Mock AI Provider
 * 
 * This provider returns mock responses for testing and development.
 * It doesn't make any actual API calls.
 */

import { BaseProvider } from '../BaseProvider';
import {
  ProviderMetadata,
  ProviderCapabilities,
  ProviderConfig,
  CodeContext,
  CodeResponse,
  AnalysisResult,
} from '../types';

export class MockProvider extends BaseProvider {
  readonly metadata: ProviderMetadata = {
    name: 'mock',
    displayName: 'Mock Provider',
    description: 'Mock provider for testing and development',
    version: '1.0.0',
    requiresApiKey: false,
    isLocal: true,
    icon: '🧪',
  };

  readonly capabilities: ProviderCapabilities = {
    codeGeneration: true,
    codeAnalysis: true,
    streaming: true,
    functionCalling: false,
    maxContextLength: 4096,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'go'],
  };

  protected async onInitialize(config: ProviderConfig): Promise<void> {
    // Mock provider doesn't need initialization
    console.log('Mock provider initialized');
  }

  async generateCode(prompt: string, context?: CodeContext): Promise<CodeResponse> {
    // Simulate API delay
    await this.delay(500);

    const language = context?.language || 'javascript';
    const mockCode = this.generateMockCode(prompt, language);

    return {
      code: mockCode,
      explanation: `This is a mock response for: "${prompt}"`,
      dependencies: ['mock-dependency-1', 'mock-dependency-2'],
      nextSteps: [
        'Test the generated code',
        'Add error handling',
        'Write unit tests',
      ],
      warnings: ['This is a mock response for development purposes'],
    };
  }

  async analyzeCode(code: string): Promise<AnalysisResult> {
    // Simulate API delay
    await this.delay(300);

    return {
      qualityScore: 85,
      issues: [
        {
          severity: 'warning',
          message: 'Consider adding error handling',
          line: 10,
          fix: 'Wrap in try-catch block',
        },
        {
          severity: 'info',
          message: 'Code could be more modular',
          line: 25,
        },
      ],
      suggestions: [
        'Add JSDoc comments',
        'Extract repeated logic into functions',
        'Consider using TypeScript for better type safety',
      ],
      complexity: 12,
    };
  }

  async *streamResponse(prompt: string): AsyncGenerator<string, void, unknown> {
    const response = `Mock streaming response for: "${prompt}"\n\nThis is a simulated stream.`;
    const words = response.split(' ');

    for (const word of words) {
      await this.delay(50);
      yield word + ' ';
    }
  }

  private generateMockCode(prompt: string, language: string): string {
    const templates: Record<string, string> = {
      javascript: `// Mock JavaScript code for: ${prompt}
function mockFunction() {
  console.log('This is mock code');
  return { success: true, message: 'Mock response' };
}

module.exports = { mockFunction };`,

      typescript: `// Mock TypeScript code for: ${prompt}
interface MockResponse {
  success: boolean;
  message: string;
}

function mockFunction(): MockResponse {
  console.log('This is mock code');
  return { success: true, message: 'Mock response' };
}

export { mockFunction, MockResponse };`,

      python: `# Mock Python code for: ${prompt}
def mock_function():
    """This is mock code"""
    print('This is mock code')
    return {'success': True, 'message': 'Mock response'}

if __name__ == '__main__':
    result = mock_function()
    print(result)`,

      java: `// Mock Java code for: ${prompt}
public class MockClass {
    public static void main(String[] args) {
        System.out.println("This is mock code");
    }
    
    public String mockMethod() {
        return "Mock response";
    }
}`,

      go: `// Mock Go code for: ${prompt}
package main

import "fmt"

func mockFunction() string {
    fmt.Println("This is mock code")
    return "Mock response"
}

func main() {
    result := mockFunction()
    fmt.Println(result)
}`,
    };

    return templates[language] || templates.javascript;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Made with Bob
