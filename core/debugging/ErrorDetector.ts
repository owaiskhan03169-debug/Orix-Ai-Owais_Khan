/**
 * Error Detection System
 * Analyzes terminal output, build logs, and runtime errors
 */

import { ErrorInfo, ErrorType, ErrorSeverity, ErrorPattern } from './types';

export class ErrorDetector {
  private patterns: ErrorPattern[] = [
    // TypeScript errors
    {
      pattern: /error TS(\d+): (.+)/,
      type: ErrorType.TYPE,
      severity: ErrorSeverity.HIGH,
      extractor: (match) => ({
        message: match[2],
        context: `TS${match[1]}`
      })
    },
    // Module not found
    {
      pattern: /Cannot find module ['"](.+)['"]/,
      type: ErrorType.IMPORT,
      severity: ErrorSeverity.HIGH,
      extractor: (match) => ({
        message: `Cannot find module '${match[1]}'`,
        context: match[1]
      })
    },
    // Syntax errors
    {
      pattern: /SyntaxError: (.+)/,
      type: ErrorType.SYNTAX,
      severity: ErrorSeverity.CRITICAL,
      extractor: (match) => ({
        message: match[1]
      })
    },
    // Build errors
    {
      pattern: /Build failed with (\d+) error/,
      type: ErrorType.BUILD,
      severity: ErrorSeverity.HIGH,
      extractor: (match) => ({
        message: `Build failed with ${match[1]} error(s)`
      })
    },
    // Dependency errors
    {
      pattern: /npm ERR! (.+)/,
      type: ErrorType.DEPENDENCY,
      severity: ErrorSeverity.MEDIUM,
      extractor: (match) => ({
        message: match[1]
      })
    },
    // Runtime errors
    {
      pattern: /Uncaught \w+Error: (.+)/,
      type: ErrorType.RUNTIME,
      severity: ErrorSeverity.HIGH,
      extractor: (match) => ({
        message: match[1]
      })
    },
    // File location pattern
    {
      pattern: /at (.+):(\d+):(\d+)/,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      extractor: (match) => ({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3])
      })
    }
  ];

  /**
   * Detect errors from terminal output
   */
  detectFromOutput(output: string): ErrorInfo[] {
    const errors: ErrorInfo[] = [];
    const lines = output.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of this.patterns) {
        const match = line.match(pattern.pattern);
        if (match) {
          const extracted = pattern.extractor(match);
          
          errors.push({
            id: this.generateErrorId(),
            timestamp: Date.now(),
            type: pattern.type,
            severity: pattern.severity,
            message: extracted.message || line,
            file: extracted.file,
            line: extracted.line,
            column: extracted.column,
            context: extracted.context,
            stack: this.extractStack(lines, i)
          });
        }
      }
    }

    return this.deduplicateErrors(errors);
  }

  /**
   * Detect errors from exception objects
   */
  detectFromException(error: Error): ErrorInfo {
    return {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      type: this.classifyError(error),
      severity: ErrorSeverity.HIGH,
      message: error.message,
      stack: error.stack
    };
  }

  /**
   * Analyze error severity based on context
   */
  analyzeSeverity(error: ErrorInfo): ErrorSeverity {
    // Critical: Syntax errors, build failures
    if (error.type === ErrorType.SYNTAX || error.type === ErrorType.BUILD) {
      return ErrorSeverity.CRITICAL;
    }

    // High: Type errors, import errors, runtime errors
    if ([ErrorType.TYPE, ErrorType.IMPORT, ErrorType.RUNTIME].includes(error.type)) {
      return ErrorSeverity.HIGH;
    }

    // Medium: Dependency issues
    if (error.type === ErrorType.DEPENDENCY) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Extract stack trace from output
   */
  private extractStack(lines: string[], startIndex: number): string {
    const stackLines: string[] = [];
    
    for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i];
      if (line.trim().startsWith('at ') || line.includes('Error:')) {
        stackLines.push(line);
      } else if (stackLines.length > 0) {
        break;
      }
    }

    return stackLines.join('\n');
  }

  /**
   * Classify error type from exception
   */
  private classifyError(error: Error): ErrorType {
    const name = error.constructor.name;
    const message = error.message.toLowerCase();

    if (name === 'SyntaxError') return ErrorType.SYNTAX;
    if (name === 'TypeError') return ErrorType.TYPE;
    if (message.includes('module') || message.includes('import')) return ErrorType.IMPORT;
    if (message.includes('network') || message.includes('fetch')) return ErrorType.NETWORK;

    return ErrorType.RUNTIME;
  }

  /**
   * Remove duplicate errors
   */
  private deduplicateErrors(errors: ErrorInfo[]): ErrorInfo[] {
    const seen = new Set<string>();
    return errors.filter(error => {
      const key = `${error.type}-${error.message}-${error.file}-${error.line}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Made with Bob
