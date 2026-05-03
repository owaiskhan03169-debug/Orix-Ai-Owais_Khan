/**
 * Understanding View Component
 * 
 * Displays the analyzed prompt understanding with visual breakdown.
 */

import { PromptUnderstanding } from '@core/understanding';

interface UnderstandingViewProps {
  understanding: PromptUnderstanding;
}

export function UnderstandingView({ understanding }: UnderstandingViewProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-2">
          📊 Prompt Analysis Complete
        </h2>
        <p className="text-gray-400">
          Analyzed in {understanding.processingTime}ms with{' '}
          {Math.round(understanding.confidence.overall * 100)}% confidence
        </p>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Project Type</div>
          <div className="text-xl font-semibold text-white capitalize">
            {understanding.projectType.replace('-', ' ')}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {Math.round(understanding.confidence.projectType * 100)}% confidence
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Complexity</div>
          <div className="text-xl font-semibold text-white capitalize">
            {understanding.complexity}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {understanding.estimatedDuration}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Architecture</div>
          <div className="text-xl font-semibold text-white capitalize">
            {understanding.architecture.replace('-', ' ')}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {understanding.estimatedFiles} files
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          🛠️ Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {understanding.technologies.map((tech, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{tech.name}</span>
                  {tech.required && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-1">{tech.reason}</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {tech.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      {understanding.features.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            ✨ Detected Features
          </h3>
          <div className="space-y-3">
            {understanding.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">
                      {feature.name.replace('-', ' ')}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        feature.priority === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : feature.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {feature.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {feature.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${feature.estimatedComplexity * 10}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      Complexity: {feature.estimatedComplexity}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UI Preferences */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          🎨 UI/UX Preferences
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-400">Style</div>
            <div className="text-white font-semibold capitalize mt-1">
              {understanding.uiStyle}
            </div>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-400">Responsive</div>
            <div className="text-white font-semibold mt-1">
              {understanding.responsive ? '✓ Yes' : '✗ No'}
            </div>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-400">Dark Mode</div>
            <div className="text-white font-semibold mt-1">
              {understanding.darkMode ? '✓ Yes' : '✗ No'}
            </div>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-400">Components</div>
            <div className="text-white font-semibold mt-1">
              ~{understanding.estimatedComponents}
            </div>
          </div>
        </div>
      </div>

      {/* Estimates */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          📈 Project Estimates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {understanding.estimatedFiles}
            </div>
            <div className="text-sm text-gray-400 mt-1">Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {understanding.estimatedComponents}
            </div>
            <div className="text-sm text-gray-400 mt-1">Components</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {understanding.estimatedPages}
            </div>
            <div className="text-sm text-gray-400 mt-1">Pages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {understanding.estimatedDuration}
            </div>
            <div className="text-sm text-gray-400 mt-1">Duration</div>
          </div>
        </div>
      </div>

      {/* Additional Context */}
      {(understanding.targetAudience ||
        understanding.businessDomain ||
        understanding.specialRequirements?.length) && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            📝 Additional Context
          </h3>
          <div className="space-y-3">
            {understanding.targetAudience && (
              <div>
                <span className="text-sm text-gray-400">Target Audience: </span>
                <span className="text-white capitalize">
                  {understanding.targetAudience}
                </span>
              </div>
            )}
            {understanding.businessDomain && (
              <div>
                <span className="text-sm text-gray-400">Business Domain: </span>
                <span className="text-white capitalize">
                  {understanding.businessDomain}
                </span>
              </div>
            )}
            {understanding.specialRequirements &&
              understanding.specialRequirements.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">
                    Special Requirements:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {understanding.specialRequirements.map((req, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Original Prompt */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">
          💬 Original Prompt
        </h3>
        <div className="p-4 bg-gray-900 rounded-lg text-gray-300 font-mono text-sm">
          "{understanding.originalPrompt}"
        </div>
      </div>
    </div>
  );
}

// Made with Bob