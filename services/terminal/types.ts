/**
 * Terminal Service Types
 * 
 * Type definitions for terminal and command execution.
 */

/**
 * Command execution options
 */
export interface CommandOptions {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: string;
  duration: number;
}

/**
 * Terminal output line
 */
export interface TerminalLine {
  id: string;
  timestamp: number;
  type: 'stdout' | 'stderr' | 'info' | 'error' | 'success';
  content: string;
}

/**
 * Process status
 */
export type ProcessStatus = 'idle' | 'running' | 'success' | 'error' | 'killed';

/**
 * Running process info
 */
export interface ProcessInfo {
  id: string;
  command: string;
  cwd: string;
  status: ProcessStatus;
  pid?: number;
  startTime: number;
  endTime?: number;
  output: TerminalLine[];
}

/**
 * Terminal session
 */
export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  processes: ProcessInfo[];
  createdAt: number;
}

// Made with Bob