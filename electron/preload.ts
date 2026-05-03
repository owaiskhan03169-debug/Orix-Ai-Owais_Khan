import { contextBridge, ipcRenderer } from 'electron';

type CommandOutputHandler = (event: {
  requestId: string;
  stream: 'stdout' | 'stderr' | 'system';
  chunk: string;
  timestamp: number;
}) => void;

contextBridge.exposeInMainWorld('electronAPI', {
  createFolder: (folderPath: string) => ipcRenderer.invoke('fs:createFolder', folderPath),
  clearFolder: (folderPath: string) => ipcRenderer.invoke('fs:clearFolder', folderPath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  pathExists: (filePath: string) => ipcRenderer.invoke('fs:pathExists', filePath),
  getAbsolutePath: (relativePath: string) => ipcRenderer.invoke('fs:getAbsolutePath', relativePath),
  getGeneratedRoot: () => ipcRenderer.invoke('fs:getGeneratedRoot'),
  executeCommand: (
    command: string,
    cwd: string,
    options?: { requestId?: string; timeoutMs?: number }
  ) => ipcRenderer.invoke('cmd:execute', command, cwd, options),
  onCommandOutput: (handler: CommandOutputHandler) => {
    const listener = (_: Electron.IpcRendererEvent, payload: Parameters<CommandOutputHandler>[0]) => {
      handler(payload);
    };

    ipcRenderer.on('cmd:output', listener);
    return () => ipcRenderer.removeListener('cmd:output', listener);
  },
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatformInfo: () => ipcRenderer.invoke('app:getPlatformInfo')
});
