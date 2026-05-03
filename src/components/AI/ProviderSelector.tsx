/**
 * Provider Selector Component
 * 
 * UI component for selecting and configuring AI providers.
 */

import { useState } from 'react';
import { ProviderType } from '@core/ai';
import { useAIStore } from '../../stores/useAIStore';

const PROVIDERS: Array<{
  type: ProviderType;
  name: string;
  description: string;
  icon: string;
  requiresApiKey: boolean;
  isLocal: boolean;
}> = [
  {
    type: 'mock',
    name: 'Mock Provider',
    description: 'For testing and development',
    icon: '🧪',
    requiresApiKey: false,
    isLocal: true,
  },
  {
    type: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models',
    icon: '🤖',
    requiresApiKey: true,
    isLocal: false,
  },
  {
    type: 'claude',
    name: 'Anthropic Claude',
    description: 'Claude 3 Opus, Sonnet, and Haiku',
    icon: '🧠',
    requiresApiKey: true,
    isLocal: false,
  },
  {
    type: 'watsonx',
    name: 'IBM watsonx',
    description: 'Enterprise AI models',
    icon: '🔷',
    requiresApiKey: true,
    isLocal: false,
  },
  {
    type: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally - privacy-focused',
    icon: '🦙',
    requiresApiKey: false,
    isLocal: true,
  },
];

export function ProviderSelector() {
  const { currentProvider, setCurrentProvider } = useAIStore();
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(
    currentProvider
  );

  const handleProviderSelect = (type: ProviderType) => {
    setSelectedProvider(type);
    setCurrentProvider(type);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Select AI Provider</h2>
        <p className="text-gray-400">
          Choose an AI provider to power Orix-AI's code generation and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.type}
            onClick={() => handleProviderSelect(provider.type)}
            className={`
              relative p-6 rounded-lg border-2 transition-all text-left
              ${
                selectedProvider === provider.type
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
            `}
          >
            {/* Selected indicator */}
            {selectedProvider === provider.type && (
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}

            {/* Provider icon and name */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{provider.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {provider.name}
                </h3>
                {provider.isLocal && (
                  <span className="text-xs text-green-400">Local</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-3">{provider.description}</p>

            {/* Requirements */}
            <div className="flex flex-wrap gap-2">
              {provider.requiresApiKey && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                  Requires API Key
                </span>
              )}
              {provider.isLocal && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  Privacy-Focused
                </span>
              )}
              {!provider.isLocal && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  Cloud-Based
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected provider info */}
      {selectedProvider && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">✓</span>
            <span className="text-white font-medium">
              {PROVIDERS.find((p) => p.type === selectedProvider)?.name} selected
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {PROVIDERS.find((p) => p.type === selectedProvider)?.requiresApiKey
              ? 'Configure your API key in settings to start using this provider.'
              : 'This provider is ready to use!'}
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
