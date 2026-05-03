/**
 * Terminal Service
 * 
 * Handles command execution and terminal operations.
 * Uses Node.js child_process for command execution.
 */

import {
  CommandOptions,
  CommandResult,
  TerminalLine,
  ProcessInfo,
  ProcessStatus,
  TerminalSession
} from './types';

export class TerminalService {
  private childProcess: any;
  private sessions: Map<string, TerminalSession> = new Map();
  private activeProcesses: Map<string, any> = new Map();

  constructor() {
    // In Electron, we can use Node.js modules
    if (typeof window !== 'undefined' && (window as any).require) {
      this.childProcess = (window as any).require('child_process');
    }
  }

  /**
   * Check if terminal is available
   */
  isAvailable(): boolean {
    return this.childProcess !== undefined;
  }

  /**
   * Execute a command and wait for completion
   */
  async executeCommand(options: CommandOptions): Promise<CommandResult> {
    const startTime = Date.now();

    if (!this.isAvailable()) {
      return {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: '',
        error: 'Terminal not available',
        duration: 0
      };
    }

    return new Promise((resolve) => {
      const { command, cwd, env, timeout = 300000, shell = true } = options;

      const proc = this.childProcess.exec(
        command,
        {
          cwd: cwd || process.cwd(),
          env: { ...process.env, ...env },
          timeout,
          shell,
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        },
        (error: any, stdout: string, stderr: string) => {
          const duration = Date.now() - startTime;

          if (error) {
            resolve({
              success: false,
              exitCode: error.code || -1,
              stdout,
              stderr,
              error: error.message,
              duration
            });
          } else {
            resolve({
              success: true,
              exitCode: 0,
              stdout,
              stderr,
              duration
            });
          }
        }
      );

      // Handle timeout
      if (timeout) {
        setTimeout(() => {
          if (proc && !proc.killed) {
            proc.kill();
          }
        }, timeout);
      }
    });
  }

  /**
   * Execute a command with real-time output streaming
   */
  executeCommandStreaming(
    options: CommandOptions,
    onOutput: (line: TerminalLine) => void
  ): ProcessInfo {
    if (!this.isAvailable()) {
      throw new Error('Terminal not available');
    }

    const processId = `proc-${Date.now()}-${Math.random()}`;
    const { command, cwd, env, shell = true } = options;

    const processInfo: ProcessInfo = {
      id: processId,
      command,
      cwd: cwd || process.cwd(),
      status: 'running',
      startTime: Date.now(),
      output: []
    };

    const proc = this.childProcess.spawn(command, {
      cwd: processInfo.cwd,
      env: { ...process.env, ...env },
      shell,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    processInfo.pid = proc.pid;
    this.activeProcesses.set(processId, proc);

    // Handle stdout
    proc.stdout.on('data', (data: Buffer) => {
      const content = data.toString();
      const line: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'stdout',
        content
      };
      processInfo.output.push(line);
      onOutput(line);
    });

    // Handle stderr
    proc.stderr.on('data', (data: Buffer) => {
      const content = data.toString();
      const line: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'stderr',
        content
      };
      processInfo.output.push(line);
      onOutput(line);
    });

    // Handle process exit
    proc.on('exit', (code: number) => {
      processInfo.status = code === 0 ? 'success' : 'error';
      processInfo.endTime = Date.now();
      this.activeProcesses.delete(processId);

      const line: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: code === 0 ? 'success' : 'error',
        content: `Process exited with code ${code}`
      };
      processInfo.output.push(line);
      onOutput(line);
    });

    // Handle errors
    proc.on('error', (error: Error) => {
      processInfo.status = 'error';
      processInfo.endTime = Date.now();
      this.activeProcesses.delete(processId);

      const line: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'error',
        content: `Error: ${error.message}`
      };
      processInfo.output.push(line);
      onOutput(line);
    });

    return processInfo;
  }

  /**
   * Kill a running process
   */
  killProcess(processId: string): boolean {
    const proc = this.activeProcesses.get(processId);
    if (proc) {
      proc.kill();
      this.activeProcesses.delete(processId);
      return true;
    }
    return false;
  }

  /**
   * Create a new terminal session
   */
  createSession(name: string, cwd: string): TerminalSession {
    const session: TerminalSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      name,
      cwd,
      processes: [],
      createdAt: Date.now()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Kill all active processes in the session
      session.processes.forEach(proc => {
        if (proc.status === 'running') {
          this.killProcess(proc.id);
        }
      });
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Common commands for project setup
   */
  async installDependencies(projectPath: string): Promise<CommandResult> {
    return this.executeCommand({
      command: 'npm install',
      cwd: projectPath
    });
  }

  async runDevServer(projectPath: string): Promise<ProcessInfo> {
    return this.executeCommandStreaming(
      {
        command: 'npm run dev',
        cwd: projectPath
      },
      () => {} // Output will be handled by caller
    );
  }

  async buildProject(projectPath: string): Promise<CommandResult> {
    return this.executeCommand({
      command: 'npm run build',
      cwd: projectPath
    });
  }

  /**
   * Check if a command exists
   */
  async commandExists(command: string): Promise<boolean> {
    try {
      const result = await this.executeCommand({
        command: `${process.platform === 'win32' ? 'where' : 'which'} ${command}`
      });
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get Node.js version
   */
  async getNodeVersion(): Promise<string | null> {
    try {
      const result = await this.executeCommand({
        command: 'node --version'
      });
      return result.success ? result.stdout.trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Get npm version
   */
  async getNpmVersion(): Promise<string | null> {
    try {
      const result = await this.executeCommand({
        command: 'npm --version'
      });
      return result.success ? result.stdout.trim() : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const terminalService = new TerminalService();

// Made with Bob