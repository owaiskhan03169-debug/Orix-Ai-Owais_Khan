/**
 * Code Generation Types
 * 
 * Type definitions for the code generation system.
 */

import { ProjectPlan } from '../planning';

/**
 * Generation status
 */
export type GenerationStatus = 
  | 'idle'
  | 'preparing'
  | 'generating'
  | 'writing'
  | 'complete'
  | 'error';

/**
 * File generation result
 */
export interface FileGenerationResult {
  path: string;
  success: boolean;
  content?: string;
  error?: string;
  linesGenerated: number;
  timeMs: number;
}

/**
 * Generation progress
 */
export interface GenerationProgress {
  status: GenerationStatus;
  currentFile: string;
  filesCompleted: number;
  filesTotal: number;
  percentage: number;
  errors: string[];
  warnings: string[];
}

/**
 * Generation options
 */
export interface GenerationOptions {
  plan: ProjectPlan;
  outputDirectory: string;
  overwrite?: boolean;
  dryRun?: boolean;
  onProgress?: (progress: GenerationProgress) => void;
}

/**
 * Generation result
 */
export interface GenerationResult {
  success: boolean;
  outputDirectory: string;
  filesGenerated: FileGenerationResult[];
  totalFiles: number;
  totalLines: number;
  totalTimeMs: number;
  errors: string[];
  warnings: string[];
}

/**
 * Code template
 */
export interface CodeTemplate {
  name: string;
  description: string;
  generate: (context: any) => string;
}

/**
 * Template context
 */
export interface TemplateContext {
  projectName: string;
  [key: string]: any;
}

// Made with Bob