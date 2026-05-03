import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipcHandlers';

let mainWindow: BrowserWindow | null = null;

function getRendererUrl(): string | null {
  if (app.isPackaged || process.env.ORIX_USE_DIST === '1') {
    return null;
  }

  return process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173';
}

async function loadRenderer(window: BrowserWindow) {
  const devUrl = getRendererUrl();

  try {
    if (devUrl) {
      await window.loadURL(devUrl);
      window.webContents.openDevTools({ mode: 'detach' });
      return;
    }

    await window.loadFile(path.join(__dirname, '../dist/index.html'));
  } catch (error) {
    console.error('Failed to load renderer:', error);
    if (!app.isPackaged) {
      await window.loadFile(path.join(__dirname, '../dist/index.html')).catch((fallbackError) => {
        console.error('Failed to load dist fallback:', fallbackError);
      });
    }
  }
}

async function runRendererSmokeTest(window: BrowserWindow) {
  if (process.env.ORIX_E2E_GENERATE !== '1') {
    return;
  }

  try {
    const result = await window.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const waitFor = async (predicate, timeoutMs, label) => {
          const started = Date.now();
          while (Date.now() - started < timeoutMs) {
            const value = predicate();
            if (value) return value;
            await sleep(250);
          }
          throw new Error('Timed out waiting for ' + label);
        };

        const clickButton = (text, root = document) => {
          const button = Array.from(root.querySelectorAll('button')).find((entry) =>
            entry.textContent && entry.textContent.trim().includes(text)
          );
          if (!button) throw new Error('Button not found: ' + text);
          button.click();
        };

        clickButton('Generate');
        const textarea = await waitFor(() => document.querySelector('main textarea'), 5000, 'generator textarea');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(textarea, 'Create a plain Node.js npm project named orix-ui-smoke-test with no external dependencies. Include package.json and index.js. Do not use React or Vite.');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(250);

        const generateButton = Array.from(document.querySelectorAll('main button')).find((entry) =>
          entry.textContent && entry.textContent.trim() === 'Generate'
        );
        if (!generateButton) throw new Error('Main Generate button not found');
        generateButton.click();

        return waitFor(() => {
          const text = document.body.innerText;
          if (text.includes('Project is ready at')) return { success: true, text };
          if (text.includes('Generation stopped')) return { success: false, text };
          return null;
        }, 10 * 60 * 1000, 'generation completion');
      })();
    `, true) as { success: boolean; text: string };

    console.log(result.success ? 'Renderer generation smoke test passed.' : 'Renderer generation smoke test failed.');
    if (!result.success) {
      console.error(result.text);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Renderer generation smoke test failed:', error);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    title: 'Orix-AI',
    backgroundColor: '#080812',
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on('render-process-gone', (_, details) => {
    console.error('Renderer process exited:', details);
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    console.error(`Renderer failed to load ${validatedURL}: ${errorCode} ${errorDescription}`);
  });

  await loadRenderer(mainWindow);
  await runRendererSmokeTest(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(async () => {
  registerIpcHandlers();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('app:getPlatformInfo', () => ({
  platform: process.platform,
  arch: process.arch,
  version: process.version,
  electron: process.versions.electron
}));
ipcMain.handle('get-platform-info', () => ({
  platform: process.platform,
  arch: process.arch,
  version: process.version,
  electron: process.versions.electron
}));
