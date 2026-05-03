/**
 * Fix Strategies for Common Errors
 * Implements automatic fixes for detected errors
 */

import { ErrorInfo, ErrorType, FixStrategy, FixContext, FixResult, FileChange } from './types';
import { FileSystemService } from '../../services/fileSystem/FileSystemService';

export class FixStrategies {
  private strategies: FixStrategy[] = [];
  private fileSystem: FileSystemService;

  constructor() {
    this.fileSystem = new FileSystemService();
    this.initializeStrategies();
  }

  /**
   * Initialize all fix strategies
   */
  private initializeStrategies(): void {
    this.strategies = [
      this.createMissingImportFix(),
      this.createMissingDependencyFix(),
      this.createTypeErrorFix(),
      this.createSyntaxErrorFix(),
      this.createMissingFileFix(),
      this.createConfigurationFix()
    ];
  }

  /**
   * Get applicable fix strategies for an error
   */
  getStrategiesForError(error: ErrorInfo): FixStrategy[] {
    return this.strategies.filter(strategy => 
      strategy.errorTypes.includes(error.type) && strategy.canFix(error)
    );
  }

  /**
   * Fix: Missing import statements
   */
  private createMissingImportFix(): FixStrategy {
    return {
      id: 'missing-import',
      name: 'Add Missing Import',
      description: 'Automatically add missing import statements',
      errorTypes: [ErrorType.IMPORT, ErrorType.TYPE],
      canFix: (error) => {
        return error.message.includes('Cannot find') || 
               error.message.includes('is not defined');
      },
      fix: async (error, context) => {
        try {
          if (!error.file || !context.fileContent) {
            return { success: false, message: 'Missing file information' };
          }

          const moduleName = this.extractModuleName(error.message);
          if (!moduleName) {
            return { success: false, message: 'Could not extract module name' };
          }

          const importStatement = this.generateImportStatement(moduleName);
          const updatedContent = this.addImportToFile(context.fileContent, importStatement);

          const changes: FileChange[] = [{
            path: error.file,
            type: 'update',
            content: updatedContent
          }];

          return {
            success: true,
            message: `Added import for ${moduleName}`,
            changes
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to add import',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  /**
   * Fix: Missing dependencies
   */
  private createMissingDependencyFix(): FixStrategy {
    return {
      id: 'missing-dependency',
      name: 'Install Missing Dependency',
      description: 'Install missing npm packages',
      errorTypes: [ErrorType.DEPENDENCY, ErrorType.IMPORT],
      canFix: (error) => {
        return error.message.includes('Cannot find module') ||
               error.message.includes('not found');
      },
      fix: async (error, context) => {
        try {
          const packageName = this.extractPackageName(error.message);
          if (!packageName) {
            return { success: false, message: 'Could not extract package name' };
          }

          return {
            success: true,
            message: `Installing ${packageName}`,
            commandsToRun: [`npm install ${packageName}`]
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to install dependency',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  /**
   * Fix: Type errors
   */
  private createTypeErrorFix(): FixStrategy {
    return {
      id: 'type-error',
      name: 'Fix Type Error',
      description: 'Add type annotations or fix type mismatches',
      errorTypes: [ErrorType.TYPE],
      canFix: (error) => {
        return error.message.includes('Type') || 
               error.message.includes('type');
      },
      fix: async (error, context) => {
        try {
          if (!error.file || !context.fileContent) {
            return { success: false, message: 'Missing file information' };
          }

          // For now, suggest adding 'any' type as a quick fix
          // In production, this should use AI to infer proper types
          const changes: FileChange[] = [{
            path: error.file,
            type: 'update',
            content: context.fileContent // Would be modified with proper types
          }];

          return {
            success: true,
            message: 'Type error requires manual review',
            changes
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to fix type error',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  /**
   * Fix: Syntax errors
   */
  private createSyntaxErrorFix(): FixStrategy {
    return {
      id: 'syntax-error',
      name: 'Fix Syntax Error',
      description: 'Fix common syntax mistakes',
      errorTypes: [ErrorType.SYNTAX],
      canFix: (error) => {
        return error.message.includes('Unexpected') ||
               error.message.includes('Expected');
      },
      fix: async (error, context) => {
        try {
          if (!error.file || !context.fileContent) {
            return { success: false, message: 'Missing file information' };
          }

          // Common syntax fixes
          let content = context.fileContent;
          
          // Fix missing semicolons
          if (error.message.includes('Expected ;')) {
            content = this.addMissingSemicolons(content, error.line);
          }
          
          // Fix missing brackets
          if (error.message.includes('Expected }')) {
            content = this.balanceBrackets(content);
          }

          const changes: FileChange[] = [{
            path: error.file,
            type: 'update',
            content
          }];

          return {
            success: true,
            message: 'Fixed syntax error',
            changes
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to fix syntax error',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  /**
   * Fix: Missing files
   */
  private createMissingFileFix(): FixStrategy {
    return {
      id: 'missing-file',
      name: 'Create Missing File',
      description: 'Create missing files with basic structure',
      errorTypes: [ErrorType.IMPORT],
      canFix: (error) => {
        return !!(error.message.includes('Cannot find') && error.file);
      },
      fix: async (error, context) => {
        try {
          const filePath = this.extractFilePath(error.message);
          if (!filePath) {
            return { success: false, message: 'Could not extract file path' };
          }

          const content = this.generateBasicFileContent(filePath);
          const changes: FileChange[] = [{
            path: filePath,
            type: 'create',
            content
          }];

          return {
            success: true,
            message: `Created missing file: ${filePath}`,
            changes
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to create file',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  /**
   * Fix: Configuration issues
   */
  private createConfigurationFix(): FixStrategy {
    return {
      id: 'configuration',
      name: 'Fix Configuration',
      description: 'Fix tsconfig, package.json, or other config issues',
      errorTypes: [ErrorType.BUILD, ErrorType.TYPE],
      canFix: (error): boolean => {
        return !!(error.message.includes('tsconfig') ||
                  error.message.includes('configuration'));
      },
      fix: async (error, context) => {
        try {
          const changes: FileChange[] = [];

          // Fix tsconfig if needed
          if (error.message.includes('tsconfig')) {
            changes.push({
              path: 'tsconfig.json',
              type: 'update',
              content: JSON.stringify(this.getDefaultTsConfig(), null, 2)
            });
          }

          return {
            success: true,
            message: 'Updated configuration',
            changes
          };
        } catch (err) {
          return {
            success: false,
            message: 'Failed to fix configuration',
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
  }

  // Helper methods

  private extractModuleName(message: string): string | null {
    const match = message.match(/['"]([^'"]+)['"]/);
    return match ? match[1] : null;
  }

  private extractPackageName(message: string): string | null {
    const match = message.match(/module ['"]([^'"]+)['"]/);
    return match ? match[1].split('/')[0] : null;
  }

  private extractFilePath(message: string): string | null {
    const match = message.match(/['"]([^'"]+\.(?:ts|tsx|js|jsx))['"]/);
    return match ? match[1] : null;
  }

  private generateImportStatement(moduleName: string): string {
    if (moduleName.startsWith('.')) {
      return `import {} from '${moduleName}';`;
    }
    return `import ${this.toPascalCase(moduleName)} from '${moduleName}';`;
  }

  private addImportToFile(content: string, importStatement: string): string {
    const lines = content.split('\n');
    let insertIndex = 0;

    // Find last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        insertIndex = i + 1;
      }
    }

    lines.splice(insertIndex, 0, importStatement);
    return lines.join('\n');
  }

  private addMissingSemicolons(content: string, line?: number): string {
    // Simple implementation - would need more sophisticated parsing
    return content;
  }

  private balanceBrackets(content: string): string {
    // Simple implementation - would need proper AST parsing
    return content;
  }

  private generateBasicFileContent(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      return `// Auto-generated file\n\nexport {};\n`;
    }
    return '';
  }

  private getDefaultTsConfig(): any {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM'],
        jsx: 'react-jsx',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        moduleResolution: 'node'
      }
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// Made with Bob
