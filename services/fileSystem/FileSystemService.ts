/**
 * File System Service
 * 
 * Handles all file system operations for project generation.
 * Uses Electron's Node.js integration for file operations.
 */

import {
  FileOperationResult,
  DirectoryResult,
  WriteFileOptions,
  ReadFileOptions,
  DirectoryScanResult,
  FileMetadata,
  WorkspaceInfo
} from './types';

export class FileSystemService {
  private fs: any;
  private path: any;

  constructor() {
    // In Electron, we can use Node.js modules
    if (typeof window !== 'undefined' && (window as any).require) {
      this.fs = (window as any).require('fs').promises;
      this.path = (window as any).require('path');
    }
  }

  /**
   * Check if file system is available
   */
  isAvailable(): boolean {
    return this.fs !== undefined && this.path !== undefined;
  }

  /**
   * Create a directory (recursive)
   */
  async createDirectory(dirPath: string): Promise<DirectoryResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      await this.fs.mkdir(dirPath, { recursive: true });

      return {
        success: true,
        path: dirPath,
        created: true
      };
    } catch (error) {
      return {
        success: false,
        path: dirPath,
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(options: WriteFileOptions): Promise<FileOperationResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      const { path, content, encoding = 'utf-8', overwrite = true } = options;

      // Check if file exists
      if (!overwrite) {
        try {
          await this.fs.access(path);
          throw new Error('File already exists and overwrite is false');
        } catch (err) {
          // File doesn't exist, continue
        }
      }

      // Ensure directory exists
      const dir = this.path.dirname(path);
      await this.createDirectory(dir);

      // Write file
      await this.fs.writeFile(path, content, encoding);

      return {
        success: true,
        path
      };
    } catch (error) {
      return {
        success: false,
        path: options.path,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Read file content
   */
  async readFile(options: ReadFileOptions): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('File system not available');
    }

    const { path, encoding = 'utf-8' } = options;
    return await this.fs.readFile(path, encoding);
  }

  /**
   * Check if file or directory exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      await this.fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<FileOperationResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      await this.fs.unlink(path);

      return {
        success: true,
        path
      };
    } catch (error) {
      return {
        success: false,
        path,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a directory (recursive)
   */
  async deleteDirectory(path: string): Promise<DirectoryResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      await this.fs.rm(path, { recursive: true, force: true });

      return {
        success: true,
        path,
        created: false
      };
    } catch (error) {
      return {
        success: false,
        path,
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Scan directory contents
   */
  async scanDirectory(dirPath: string, recursive: boolean = false): Promise<DirectoryScanResult> {
    if (!this.isAvailable()) {
      throw new Error('File system not available');
    }

    const files: string[] = [];
    const directories: string[] = [];

    const scan = async (currentPath: string) => {
      const entries = await this.fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = this.path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          directories.push(fullPath);
          if (recursive) {
            await scan(fullPath);
          }
        } else {
          files.push(fullPath);
        }
      }
    };

    await scan(dirPath);

    return {
      files,
      directories,
      total: files.length + directories.length
    };
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<FileMetadata> {
    if (!this.isAvailable()) {
      throw new Error('File system not available');
    }

    const stats = await this.fs.stat(path);
    const name = this.path.basename(path);

    return {
      path,
      name,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  }

  /**
   * Get workspace information
   */
  async getWorkspaceInfo(rootPath: string): Promise<WorkspaceInfo> {
    const exists = await this.exists(rootPath);

    if (!exists) {
      return {
        root: rootPath,
        exists: false,
        files: [],
        directories: []
      };
    }

    const scan = await this.scanDirectory(rootPath, true);

    return {
      root: rootPath,
      exists: true,
      files: scan.files,
      directories: scan.directories
    };
  }

  /**
   * Copy file
   */
  async copyFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      // Ensure destination directory exists
      const dir = this.path.dirname(destination);
      await this.createDirectory(dir);

      await this.fs.copyFile(source, destination);

      return {
        success: true,
        path: destination
      };
    } catch (error) {
      return {
        success: false,
        path: destination,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Move/rename file
   */
  async moveFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      if (!this.isAvailable()) {
        throw new Error('File system not available');
      }

      // Ensure destination directory exists
      const dir = this.path.dirname(destination);
      await this.createDirectory(dir);

      await this.fs.rename(source, destination);

      return {
        success: true,
        path: destination
      };
    } catch (error) {
      return {
        success: false,
        path: destination,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create multiple directories at once
   */
  async createDirectories(paths: string[]): Promise<DirectoryResult[]> {
    const results: DirectoryResult[] = [];

    for (const path of paths) {
      const result = await this.createDirectory(path);
      results.push(result);
    }

    return results;
  }

  /**
   * Write multiple files at once
   */
  async writeFiles(files: WriteFileOptions[]): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];

    for (const file of files) {
      const result = await this.writeFile(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Get path utilities
   */
  getPathUtils() {
    return {
      join: (...paths: string[]) => this.path.join(...paths),
      dirname: (path: string) => this.path.dirname(path),
      basename: (path: string) => this.path.basename(path),
      extname: (path: string) => this.path.extname(path),
      resolve: (...paths: string[]) => this.path.resolve(...paths),
      relative: (from: string, to: string) => this.path.relative(from, to)
    };
  }
}

// Export singleton instance
export const fileSystemService = new FileSystemService();

// Made with Bob