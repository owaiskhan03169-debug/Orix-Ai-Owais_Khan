/**
 * Types for Self-Healing Debug Workflow
 * Handles error detection, analysis, and automatic fixing
 */

export interface ErrorInfo {
  id: string;
  timestamp: number;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  context?: string;
}

export enum ErrorType {
  SYNTAX = 'syntax',
  RUNTIME = 'runtime',
  BUILD = 'build',
  DEPENDENCY = 'dependency',
  TYPE = 'type',
  IMPORT = 'import',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ErrorPattern {
  pattern: RegExp;
  type: ErrorType;
  severity: ErrorSeverity;
  extractor: (match: RegExpMatchArray) => Partial<ErrorInfo>;
}

export interface FixStrategy {
  id: string;
  name: string;
  description: string;
  errorTypes: ErrorType[];
  canFix: (error: ErrorInfo) => boolean;
  fix: (error: ErrorInfo, context: FixContext) => Promise<FixResult>;
}

export interface FixContext {
  projectPath: string;
  fileContent?: string;
  dependencies?: Record<string, string>;
  tsConfig?: any;
  packageJson?: any;
}

export interface FixResult {
  success: boolean;
  message: string;
  changes?: FileChange[];
  commandsToRun?: string[];
  error?: string;
}

export interface FileChange {
  path: string;
  type: 'create' | 'update' | 'delete';
  content?: string;
  diff?: string;
}

export interface DebugSession {
  id: string;
  startTime: number;
  endTime?: number;
  errors: ErrorInfo[];
  fixes: FixAttempt[];
  status: DebugStatus;
  iterations: number;
  maxIterations: number;
}

export interface FixAttempt {
  id: string;
  timestamp: number;
  errorId: string;
  strategyId: string;
  result: FixResult;
  verified: boolean;
}

export enum DebugStatus {
  ANALYZING = 'analyzing',
  FIXING = 'fixing',
  VERIFYING = 'verifying',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface DebugConfig {
  maxIterations: number;
  autoFix: boolean;
  verifyFixes: boolean;
  timeout: number;
}

// Made with Bob
