import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

interface CommandOptions {
  requestId?: string;
  timeoutMs?: number;
}

interface CommandResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
}

const generatedRoot = path.resolve(process.cwd(), 'generated-projects');

function ensureInsideGeneratedRoot(targetPath: string): string {
  const resolved = path.resolve(generatedRoot, targetPath);
  const relative = path.relative(generatedRoot, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Path must stay inside generated-projects.');
  }

  return resolved;
}

function ensureCommandCwd(cwd: string): string {
  const resolved = path.resolve(cwd);
  const relative = path.relative(generatedRoot, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Commands can only run inside generated-projects.');
  }

  return resolved;
}

function sendCommandOutput(
  event: IpcMainInvokeEvent,
  requestId: string,
  stream: 'stdout' | 'stderr' | 'system',
  chunk: string
) {
  if (event.sender.isDestroyed()) {
    return;
  }

  event.sender.send('cmd:output', {
    requestId,
    stream,
    chunk,
    timestamp: Date.now()
  });
}

export function registerIpcHandlers() {
  ipcMain.handle('fs:getGeneratedRoot', async () => {
    await fs.mkdir(generatedRoot, { recursive: true });
    return generatedRoot;
  });

  ipcMain.handle('fs:getAbsolutePath', async (_, relativePath: string) => {
    await fs.mkdir(generatedRoot, { recursive: true });
    return ensureInsideGeneratedRoot(relativePath);
  });

  ipcMain.handle('fs:createFolder', async (_, folderPath: string) => {
    const fullPath = ensureInsideGeneratedRoot(folderPath);
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  });

  ipcMain.handle('fs:clearFolder', async (_, folderPath: string) => {
    const fullPath = ensureInsideGeneratedRoot(folderPath);
    await fs.rm(fullPath, { recursive: true, force: true });
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  });

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    const fullPath = ensureInsideGeneratedRoot(filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return fullPath;
  });

  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    const fullPath = ensureInsideGeneratedRoot(filePath);
    return fs.readFile(fullPath, 'utf-8');
  });

  ipcMain.handle('fs:pathExists', async (_, filePath: string) => {
    const fullPath = ensureInsideGeneratedRoot(filePath);
    return existsSync(fullPath);
  });

  ipcMain.handle(
    'cmd:execute',
    async (
      event,
      command: string,
      cwd: string,
      options: CommandOptions = {}
    ): Promise<CommandResult> => {
      const requestId = options.requestId || `cmd-${Date.now()}`;
      const commandCwd = ensureCommandCwd(cwd);
      const timeoutMs = options.timeoutMs ?? 10 * 60 * 1000;

      await fs.mkdir(commandCwd, { recursive: true });
      sendCommandOutput(event, requestId, 'system', `Running: ${command}\n`);

      return new Promise<CommandResult>((resolve) => {
        let stdout = '';
        let stderr = '';
        let settled = false;

        const child = spawn(command, {
          cwd: commandCwd,
          shell: true,
          windowsHide: true,
          env: {
            ...process.env,
            npm_config_fund: 'false',
            npm_config_audit: 'false'
          }
        });

        const timer = setTimeout(() => {
          if (!settled) {
            child.kill();
            sendCommandOutput(event, requestId, 'system', `Command timed out after ${timeoutMs}ms.\n`);
          }
        }, timeoutMs);

        child.stdout?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stdout += chunk;
          sendCommandOutput(event, requestId, 'stdout', chunk);
        });

        child.stderr?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stderr += chunk;
          sendCommandOutput(event, requestId, 'stderr', chunk);
        });

        child.on('error', (error) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          sendCommandOutput(event, requestId, 'system', `Command failed to start: ${error.message}\n`);
          resolve({
            success: false,
            exitCode: null,
            stdout,
            stderr,
            error: error.message
          });
        });

        child.on('close', (code) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          sendCommandOutput(event, requestId, 'system', `Command exited with code ${code}.\n`);
          resolve({
            success: code === 0,
            exitCode: code,
            stdout,
            stderr,
            error: code === 0 ? undefined : `Command exited with code ${code}.`
          });
        });
      });
    }
  );
}

export function focusMainWindow() {
  BrowserWindow.getAllWindows()[0]?.focus();
}
