/**
 * Prompt Understanding Types
 * 
 * Type definitions for the prompt understanding and analysis system.
 */

/**
 * Project type classification
 */
export type ProjectType = 
  | 'website'
  | 'web-app'
  | 'mobile-app'
  | 'desktop-app'
  | 'api'
  | 'library'
  | 'cli-tool'
  | 'game'
  | 'unknown';

/**
 * Project complexity level
 */
export type ComplexityLevel = 'simple' | 'medium' | 'complex' | 'enterprise';

/**
 * Technology categories
 */
export type TechnologyCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'styling'
  | 'testing'
  | 'deployment'
  | 'other';

/**
 * Technology recommendation
 */
export interface Technology {
  name: string;
  category: TechnologyCategory;
  version?: string;
  required: boolean;
  reason: string;
}

/**
 * Detected feature from prompt
 */
export interface Feature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedComplexity: number; // 1-10
}

/**
 * Architecture type
 */
export type ArchitectureType = 
  | 'frontend-only'
  | 'backend-only'
  | 'fullstack'
  | 'microservices'
  | 'serverless'
  | 'monolithic';

/**
 * UI/UX style preference
 */
export type UIStyle = 
  | 'modern'
  | 'minimal'
  | 'professional'
  | 'creative'
  | 'playful'
  | 'elegant'
  | 'futuristic'
  | 'classic';

/**
 * Structured understanding of a user prompt
 */
export interface PromptUnderstanding {
  // Original prompt
  originalPrompt: string;
  
  // Project classification
  projectType: ProjectType;
  complexity: ComplexityLevel;
  
  // Technical requirements
  technologies: Technology[];
  architecture: ArchitectureType;
  
  // Features and functionality
  features: Feature[];
  
  // UI/UX preferences
  uiStyle: UIStyle;
  responsive: boolean;
  darkMode: boolean;
  
  // Estimates
  estimatedFiles: number;
  estimatedComponents: number;
  estimatedPages: number;
  estimatedDuration: string; // e.g., "2-3 hours"
  
  // Additional context
  targetAudience?: string;
  businessDomain?: string;
  specialRequirements?: string[];
  
  // Confidence scores
  confidence: {
    projectType: number; // 0-1
    technologies: number; // 0-1
    features: number; // 0-1
    overall: number; // 0-1
  };
  
  // Analysis metadata
  analyzedAt: number;
  processingTime: number; // milliseconds
}

/**
 * Prompt analysis context
 */
export interface AnalysisContext {
  // User preferences
  preferredTechnologies?: string[];
  preferredFrameworks?: string[];
  
  // Project constraints
  maxComplexity?: ComplexityLevel;
  requiredFeatures?: string[];
  
  // AI provider context
  providerType: string;
  model?: string;
}

/**
 * Keyword patterns for detection
 */
export interface KeywordPattern {
  keywords: string[];
  category: string;
  weight: number;
  implies?: string[];
}

/**
 * Analysis result from AI provider
 */
export interface AIAnalysisResult {
  understanding: Partial<PromptUnderstanding>;
  reasoning: string;
  suggestions?: string[];
  warnings?: string[];
}

// Made with Bob