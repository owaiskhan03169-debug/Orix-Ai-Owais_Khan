import { useState, useEffect } from 'react';
import { ProviderSelector } from './components/AI/ProviderSelector';
import { PromptInput } from './components/PromptInput/PromptInput';
import { useAIStore } from './stores/useAIStore';

function App() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'providers'>('create');
  
  const { currentProvider } = useAIStore();

  useEffect(() => {
    // Test Electron API
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion);
      window.electronAPI.getPlatformInfo().then(setPlatformInfo);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Orix-AI
          </h1>
          <p className="text-xl text-gray-400">
            AI-Native Autonomous Development Environment
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🚀 Create Project
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'providers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ⚙️ AI Providers
              {currentProvider && (
                <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {/* Create Project Tab */}
          {activeTab === 'create' && (
            <PromptInput />
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <ProviderSelector />
              
              {/* System Info */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📊 System Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">App Version:</span>
                    <span className="font-mono">{appVersion || 'Loading...'}</span>
                  </div>
                  
                  {platformInfo && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Platform:</span>
                        <span className="font-mono">{platformInfo.platform}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Architecture:</span>
                        <span className="font-mono">{platformInfo.arch}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Node Version:</span>
                        <span className="font-mono">{platformInfo.version}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Phase 4: Prompt Understanding Engine - Active ✅</p>
          <p className="mt-1">Transform ideas into software autonomously</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
