/**
 * Plan View Component
 * 
 * Displays the complete project plan with visual breakdown.
 */

import { ProjectPlan } from '@core/planning';

interface PlanViewProps {
  plan: ProjectPlan;
  warnings: string[];
  suggestions: string[];
  onGenerate?: () => void;
}

export function PlanView({ plan, warnings, suggestions, onGenerate }: PlanViewProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
        <h2 className="text-2xl font-bold text-white mb-2">
          📋 Project Plan Ready
        </h2>
        <p className="text-gray-400">
          {plan.name} • {plan.totalFiles} files • {plan.totalComponents} components
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            ⚠️ Warnings
          </h3>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-300 flex items-start gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Total Files</div>
          <div className="text-3xl font-bold text-blue-400">{plan.totalFiles}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Components</div>
          <div className="text-3xl font-bold text-purple-400">{plan.totalComponents}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Routes</div>
          <div className="text-3xl font-bold text-green-400">{plan.totalRoutes}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Est. Lines</div>
          <div className="text-3xl font-bold text-yellow-400">{plan.totalLines.toLocaleString()}</div>
        </div>
      </div>

      {/* File Tree */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📁 Project Structure
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="font-mono text-sm space-y-1">
            {plan.fileTree.slice(0, 30).map((file, index) => (
              <div key={index} className="text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                {file}
              </div>
            ))}
            {plan.fileTree.length > 30 && (
              <div className="text-gray-500 px-2 py-1">
                ... and {plan.fileTree.length - 30} more files
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🧩 Components ({plan.components.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.components.slice(0, 12).map((component, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{component.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{component.path}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  component.type === 'page' ? 'bg-blue-500/20 text-blue-400' :
                  component.type === 'layout' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {component.type}
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-2">{component.description}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${component.complexity * 10}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {component.complexity}/10
                </span>
              </div>
            </div>
          ))}
          {plan.components.length > 12 && (
            <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center text-gray-500">
              +{plan.components.length - 12} more components
            </div>
          )}
        </div>
      </div>

      {/* Routes */}
      {plan.routes.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🛣️ Routes ({plan.routes.length})
          </h3>
          <div className="space-y-2">
            {plan.routes.map((route, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-400">{route.path}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-white">{route.component}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{route.description}</div>
                </div>
                {route.protected && (
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                    Protected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📦 Dependencies ({plan.dependencies.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.dependencies.map((dep, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-3">
              <div className="font-mono text-sm text-white">{dep.name}</div>
              <div className="text-xs text-gray-500 mt-1">{dep.version}</div>
              {dep.required && (
                <span className="text-xs text-blue-400">Required</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Build Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          ⚙️ Build Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Entry Point</div>
            <div className="font-mono text-white">{plan.buildConfig.entry}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Output Directory</div>
            <div className="font-mono text-white">{plan.buildConfig.output}</div>
          </div>
          {plan.buildConfig.devServer && (
            <>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Dev Server</div>
                <div className="font-mono text-white">
                  {plan.buildConfig.devServer.host}:{plan.buildConfig.devServer.port}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Hot Reload</div>
                <div className="text-white">
                  {plan.buildConfig.devServer.hot ? '✓ Enabled' : '✗ Disabled'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generation Estimates */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          ⏱️ Generation Estimates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {Math.ceil(plan.estimatedGenerationTime / 1000)}s
            </div>
            <div className="text-sm text-gray-400 mt-1">Generation Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {plan.generationOrder.length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Files to Generate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {plan.understanding.estimatedDuration}
            </div>
            <div className="text-sm text-gray-400 mt-1">Development Time</div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
            💡 Suggestions
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-300 flex items-start gap-2">
                <span>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">
          🚀 Ready to Generate Code
        </h3>
        <p className="text-gray-300 mb-4">
          The project plan is complete and ready for code generation. This will create
          all {plan.totalFiles} files with production-quality code.
        </p>
        <button
          onClick={onGenerate}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          ⚡ Generate Project Code →
        </button>
      </div>
    </div>
  );
}

// Made with Bob