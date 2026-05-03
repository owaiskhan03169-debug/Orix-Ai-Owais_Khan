/**
 * Types for Code Explanation System
 * Handles code analysis and educational explanations
 */

export interface ExplanationRequest {
  code?: string;
  filePath?: string;
  projectPath?: string;
  language?: string;
  level: ExplanationLevel;
  focus?: ExplanationFocus[];
}

export enum ExplanationLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ExplanationFocus {
  ARCHITECTURE = 'architecture',
  LOGIC = 'logic',
  ALGORITHMS = 'algorithms',
  DATA_FLOW = 'data_flow',
  STATE_MANAGEMENT = 'state_management',
  API = 'api',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BEST_PRACTICES = 'best_practices',
  PATTERNS = 'patterns'
}

export interface CodeExplanation {
  id: string;
  timestamp: number;
  request: ExplanationRequest;
  sections: ExplanationSection[];
  summary: string;
  keyPoints: string[];
  recommendations?: string[];
  relatedConcepts?: string[];
}

export interface ExplanationSection {
  title: string;
  content: string;
  codeSnippets?: CodeSnippet[];
  diagrams?: string[];
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface CodeSnippet {
  code: string;
  language: string;
  explanation: string;
  lineHighlights?: number[];
}

export interface CodeAnalysis {
  structure: StructureAnalysis;
  complexity: ComplexityAnalysis;
  patterns: PatternAnalysis[];
  dependencies: DependencyAnalysis;
  quality: QualityMetrics;
}

export interface StructureAnalysis {
  type: 'function' | 'class' | 'component' | 'module' | 'file' | 'project';
  name: string;
  purpose: string;
  components: ComponentInfo[];
  relationships: Relationship[];
}

export interface ComponentInfo {
  name: string;
  type: string;
  description: string;
  location: CodeLocation;
}

export interface CodeLocation {
  file?: string;
  startLine: number;
  endLine: number;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'uses' | 'contains';
  description?: string;
}

export interface ComplexityAnalysis {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  assessment: 'simple' | 'moderate' | 'complex' | 'very_complex';
  suggestions?: string[];
}

export interface PatternAnalysis {
  pattern: string;
  category: 'design' | 'architectural' | 'behavioral' | 'creational';
  description: string;
  location: CodeLocation;
  benefits: string[];
  tradeoffs?: string[];
}

export interface DependencyAnalysis {
  internal: string[];
  external: string[];
  graph: DependencyNode[];
  issues?: DependencyIssue[];
}

export interface DependencyNode {
  name: string;
  version?: string;
  dependsOn: string[];
  usedBy: string[];
}

export interface DependencyIssue {
  type: 'circular' | 'unused' | 'outdated' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface QualityMetrics {
  readability: number; // 0-100
  maintainability: number; // 0-100
  testability: number; // 0-100
  performance: number; // 0-100
  security: number; // 0-100
  overall: number; // 0-100
  issues: QualityIssue[];
}

export interface QualityIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  location?: CodeLocation;
  fix?: string;
}

export interface ExplanationTemplate {
  level: ExplanationLevel;
  sections: string[];
  style: 'concise' | 'detailed' | 'tutorial' | 'reference';
  includeExamples: boolean;
  includeDiagrams: boolean;
}

// Made with Bob
