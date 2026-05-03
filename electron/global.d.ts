export interface CommandOutputEvent {
  requestId: string;
  stream: 'stdout' | 'stderr' | 'system';
  chunk: string;
  timestamp: number;
}

export interface CommandResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface ElectronAPI {
  createFolder: (path: string) => Promise<string>;
  clearFolder: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<string>;
  readFile: (path: string) => Promise<string>;
  pathExists: (path: string) => Promise<boolean>;
  getAbsolutePath: (relativePath: string) => Promise<string>;
  getGeneratedRoot: () => Promise<string>;
  executeCommand: (
    command: string,
    cwd: string,
    options?: { requestId?: string; timeoutMs?: number }
  ) => Promise<CommandResult>;
  onCommandOutput: (handler: (event: CommandOutputEvent) => void) => () => void;
  getAppVersion: () => Promise<string>;
  getPlatformInfo: () => Promise<{
    platform: NodeJS.Platform;
    arch: string;
    version: string;
    electron: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
