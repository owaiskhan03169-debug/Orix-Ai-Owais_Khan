/**
 * Self-Healing Debug Service
 * Orchestrates error detection, analysis, and automatic fixing
 */

import { ErrorDetector } from './ErrorDetector';
import { FixStrategies } from './FixStrategies';
import {
  DebugSession,
  DebugConfig,
  ErrorInfo,
  FixAttempt,
  DebugStatus,
  FixResult
} from './types';
import { FileSystemService } from '../../services/fileSystem/FileSystemService';
import { TerminalService } from '../../services/terminal/TerminalService';

export class DebugService {
  private errorDetector: ErrorDetector;
  private fixStrategies: FixStrategies;
  private fileSystem: FileSystemService;
  private terminal: TerminalService;
  private activeSessions: Map<string, DebugSession>;

  constructor() {
    this.errorDetector = new ErrorDetector();
    this.fixStrategies = new FixStrategies();
    this.fileSystem = new FileSystemService();
    this.terminal = new TerminalService();
    this.activeSessions = new Map();
  }

  /**
   * Start a new debug session
   */
  async startDebugSession(
    projectPath: string,
    config: Partial<DebugConfig> = {}
  ): Promise<DebugSession> {
    const session: DebugSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      errors: [],
      fixes: [],
      status: DebugStatus.ANALYZING,
      iterations: 0,
      maxIterations: config.maxIterations || 5
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Analyze terminal output for errors
   */
  async analyzeOutput(sessionId: string, output: string): Promise<ErrorInfo[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = DebugStatus.ANALYZING;
    const errors = this.errorDetector.detectFromOutput(output);
    
    // Add new errors to session
    for (const error of errors) {
      if (!this.isDuplicateError(session.errors, error)) {
        session.errors.push(error);
      }
    }

    return errors;
  }

  /**
   * Attempt to fix detected errors
   */
  async fixErrors(
    sessionId: string,
    projectPath: string,
    autoApply: boolean = true
  ): Promise<FixAttempt[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = DebugStatus.FIXING;
    session.iterations++;

    if (session.iterations > session.maxIterations) {
      session.status = DebugStatus.FAILED;
      throw new Error('Max iterations reached');
    }

    const attempts: FixAttempt[] = [];

    // Process each error
    for (const error of session.errors) {
      // Skip if already fixed
      if (this.isErrorFixed(session.fixes, error.id)) {
        continue;
      }

      // Get applicable fix strategies
      const strategies = this.fixStrategies.getStrategiesForError(error);

      for (const strategy of strategies) {
        try {
          // Prepare fix context
          const context = await this.prepareFixContext(projectPath, error);

          // Attempt fix
          const result = await strategy.fix(error, context);

          const attempt: FixAttempt = {
            id: this.generateAttemptId(),
            timestamp: Date.now(),
            errorId: error.id,
            strategyId: strategy.id,
            result,
            verified: false
          };

          attempts.push(attempt);
          session.fixes.push(attempt);

          // Apply changes if successful and auto-apply is enabled
          if (result.success && autoApply) {
            await this.applyFix(projectPath, result);
            attempt.verified = true;
          }

          // If fix was successful, move to next error
          if (result.success) {
            break;
          }
        } catch (err) {
          console.error(`Fix strategy ${strategy.id} failed:`, err);
        }
      }
    }

    return attempts;
  }

  /**
   * Run full debug cycle: analyze → fix → verify
   */
  async runDebugCycle(
    projectPath: string,
    command: string,
    config: Partial<DebugConfig> = {}
  ): Promise<DebugSession> {
    const session = await this.startDebugSession(projectPath, config);

    try {
      while (session.iterations < session.maxIterations) {
        // Run command and capture output
        session.status = DebugStatus.ANALYZING;
        const result = await this.terminal.executeCommand({
          command,
          cwd: projectPath
        });

        // Analyze output for errors
        const errors = await this.analyzeOutput(session.id, result.stdout + result.stderr);

        // If no errors, we're done
        if (errors.length === 0) {
          session.status = DebugStatus.COMPLETED;
          session.endTime = Date.now();
          break;
        }

        // Attempt to fix errors
        const attempts = await this.fixErrors(session.id, projectPath, config.autoFix !== false);

        // If no successful fixes, stop
        const successfulFixes = attempts.filter(a => a.result.success);
        if (successfulFixes.length === 0) {
          session.status = DebugStatus.FAILED;
          session.endTime = Date.now();
          break;
        }

        // Verify fixes by running command again
        if (config.verifyFixes !== false) {
          session.status = DebugStatus.VERIFYING;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
        }
      }

      if (session.status === DebugStatus.FIXING || session.status === DebugStatus.VERIFYING) {
        session.status = session.errors.length === 0 ? DebugStatus.COMPLETED : DebugStatus.FAILED;
        session.endTime = Date.now();
      }
    } catch (err) {
      session.status = DebugStatus.FAILED;
      session.endTime = Date.now();
      throw err;
    }

    return session;
  }

  /**
   * Get debug session
   */
  getSession(sessionId: string): DebugSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): DebugSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * End debug session
   */
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session && !session.endTime) {
      session.endTime = Date.now();
      if (session.status === DebugStatus.ANALYZING || session.status === DebugStatus.FIXING) {
        session.status = DebugStatus.FAILED;
      }
    }
  }

  /**
   * Clear completed sessions
   */
  clearCompletedSessions(): void {
    for (const [id, session] of this.activeSessions.entries()) {
      if (session.status === DebugStatus.COMPLETED || session.status === DebugStatus.FAILED) {
        this.activeSessions.delete(id);
      }
    }
  }

  // Private helper methods

  private async prepareFixContext(projectPath: string, error: ErrorInfo): Promise<any> {
    const context: any = {
      projectPath
    };

    // Load file content if error has file reference
    if (error.file) {
      try {
        const fullPath = `${projectPath}/${error.file}`;
        context.fileContent = await this.fileSystem.readFile({ path: fullPath });
      } catch (err) {
        console.warn(`Could not read file ${error.file}:`, err);
      }
    }

    // Load package.json
    try {
      const packageJsonPath = `${projectPath}/package.json`;
      const packageJsonContent = await this.fileSystem.readFile({ path: packageJsonPath });
      context.packageJson = JSON.parse(packageJsonContent);
      context.dependencies = context.packageJson.dependencies || {};
    } catch (err) {
      console.warn('Could not read package.json:', err);
    }

    // Load tsconfig.json
    try {
      const tsconfigPath = `${projectPath}/tsconfig.json`;
      const tsconfigContent = await this.fileSystem.readFile({ path: tsconfigPath });
      context.tsConfig = JSON.parse(tsconfigContent);
    } catch (err) {
      console.warn('Could not read tsconfig.json:', err);
    }

    return context;
  }

  private async applyFix(projectPath: string, result: FixResult): Promise<void> {
    // Apply file changes
    if (result.changes) {
      for (const change of result.changes) {
        const fullPath = `${projectPath}/${change.path}`;
        
        if (change.type === 'create' || change.type === 'update') {
          if (change.content) {
            await this.fileSystem.writeFile({ path: fullPath, content: change.content });
          }
        } else if (change.type === 'delete') {
          await this.fileSystem.deleteFile(fullPath);
        }
      }
    }

    // Run commands
    if (result.commandsToRun) {
      for (const command of result.commandsToRun) {
        await this.terminal.executeCommand({
          command,
          cwd: projectPath
        });
      }
    }
  }

  private isDuplicateError(errors: ErrorInfo[], newError: ErrorInfo): boolean {
    return errors.some(e => 
      e.type === newError.type &&
      e.message === newError.message &&
      e.file === newError.file &&
      e.line === newError.line
    );
  }

  private isErrorFixed(fixes: FixAttempt[], errorId: string): boolean {
    return fixes.some(f => f.errorId === errorId && f.result.success && f.verified);
  }

  private generateSessionId(): string {
    return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAttemptId(): string {
    return `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Made with Bob
