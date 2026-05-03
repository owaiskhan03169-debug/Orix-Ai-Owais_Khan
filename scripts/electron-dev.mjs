import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import http from 'node:http';

const isWindows = process.platform === 'win32';
const npmBin = isWindows ? 'npm.cmd' : 'npm';
const electronBin = isWindows ? 'electron.cmd' : 'electron';
const mainBundle = resolve('dist-electron', 'main.js');
const childEnv = { ...process.env };
delete childEnv.ELECTRON_RUN_AS_NODE;

let electronProcess;
let rendererUrl;
let shuttingDown = false;
let startTimer;

const viteProcess = spawn(npmBin, ['run', 'dev', '--', '--host', '127.0.0.1'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: isWindows,
  env: {
    ...childEnv,
    FORCE_COLOR: '1'
  }
});

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  electronProcess?.kill();
  viteProcess.kill();
  process.exit(exitCode);
}

function maybeStartElectron(chunk) {
  if (electronProcess) {
    return;
  }

  const match = chunk.match(/http:\/\/(?:localhost|127\.0\.0\.1):\d+/);
  if (match) {
    rendererUrl = match[0].replace('127.0.0.1', 'localhost');
  }

  if (!rendererUrl) {
    return;
  }

  if (!existsSync(mainBundle)) {
    if (!startTimer) {
      startTimer = setInterval(() => maybeStartElectron(''), 250);
    }
    return;
  }

  if (startTimer) {
    clearInterval(startTimer);
    startTimer = undefined;
  }

  electronProcess = spawn(electronBin, ['.'], {
    stdio: 'inherit',
    shell: isWindows,
    env: {
      ...childEnv,
      VITE_DEV_SERVER_URL: rendererUrl
    }
  });

  electronProcess.on('exit', (code) => {
    shutdown(code ?? 0);
  });
}

function probeUrl(url) {
  return new Promise((resolveProbe) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolveProbe(response.statusCode && response.statusCode < 500);
    });

    request.on('error', () => resolveProbe(false));
    request.setTimeout(750, () => {
      request.destroy();
      resolveProbe(false);
    });
  });
}

async function pollRendererUrl() {
  const ports = Array.from({ length: 20 }, (_, index) => 5173 + index);

  while (!shuttingDown && !electronProcess) {
    if (!rendererUrl) {
      for (const port of ports) {
        const candidate = `http://localhost:${port}`;
        if (await probeUrl(candidate)) {
          rendererUrl = candidate;
          break;
        }
      }
    }

    maybeStartElectron('');
    await new Promise((resolvePoll) => setTimeout(resolvePoll, 500));
  }
}

void pollRendererUrl();

viteProcess.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  maybeStartElectron(text);
});

viteProcess.stderr.on('data', (data) => {
  const text = data.toString();
  process.stderr.write(text);
  maybeStartElectron(text);
});

viteProcess.on('exit', (code) => {
  if (!shuttingDown) {
    shutdown(code ?? 1);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
