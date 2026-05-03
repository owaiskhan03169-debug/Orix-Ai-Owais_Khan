/**
 * File System Types
 * 
 * Type definitions for file system operations.
 */

/**
 * File operation result
 */
export interface FileOperationResult {
  success: boolean;
  path: string;
  error?: string;
}

/**
 * Directory creation result
 */
export interface DirectoryResult {
  success: boolean;
  path: string;
  created: boolean;
  error?: string;
}

/**
 * File write options
 */
export interface WriteFileOptions {
  path: string;
  content: string;
  encoding?: BufferEncoding;
  overwrite?: boolean;
}

/**
 * File read options
 */
export interface ReadFileOptions {
  path: string;
  encoding?: BufferEncoding;
}

/**
 * Directory scan result
 */
export interface DirectoryScanResult {
  files: string[];
  directories: string[];
  total: number;
}

/**
 * File metadata
 */
export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  created: Date;
  modified: Date;
  isDirectory: boolean;
}

/**
 * Workspace info
 */
export interface WorkspaceInfo {
  root: string;
  exists: boolean;
  files: string[];
  directories: string[];
}

// Made with Bob