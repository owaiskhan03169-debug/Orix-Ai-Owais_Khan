import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Play, RotateCcw } from 'lucide-react';
import { GeneratedProject, ollamaService } from '../../services/ollamaService';

type GenerationStatus =
  | 'idle'
  | 'checking'
  | 'generating'
  | 'writing'
  | 'installing'
  | 'complete'
  | 'install_failed'
  | 'error';

type LogType = 'info' | 'success' | 'warning' | 'error' | 'stdout' | 'stderr';

interface LogLine {
  id: string;
  time: string;
  message: string;
  type: LogType;
}

interface PromptInputProps {
  initialPrompt?: string;
  onPromptChange?: (prompt: string) => void;
}

interface LastProject {
  project: GeneratedProject;
  absolutePath: string;
}

interface VerificationResult {
  success: boolean;
  stage: 'install' | 'build';
  log: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isBusy(status: GenerationStatus): boolean {
  return ['checking', 'generating', 'writing', 'installing'].includes(status);
}

function splitOutput(chunk: string): string[] {
  return chunk
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

export function PromptInput({ initialPrompt = '', onPromptChange }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [lastProject, setLastProject] = useState<LastProject | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const currentCommandIdRef = useRef<string | null>(null);

  const addLog = (message: string, type: LogType = 'info') => {
    setLogs((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        message,
        type
      }
    ]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!window.electronAPI?.onCommandOutput) {
      return;
    }

    return window.electronAPI.onCommandOutput((event) => {
      if (event.requestId !== currentCommandIdRef.current) {
        return;
      }

      const type: LogType = event.stream === 'stderr' ? 'stderr' : event.stream === 'system' ? 'info' : 'stdout';
      for (const line of splitOutput(event.chunk)) {
        addLog(line, type);
      }
    });
  }, []);

  const updatePrompt = (value: string) => {
    setPrompt(value);
    onPromptChange?.(value);
  };

  const writeProjectFiles = async (project: GeneratedProject): Promise<string> => {
    await window.electronAPI.clearFolder(project.projectName);
    addLog(`Prepared clean project folder: generated-projects/${project.projectName}`, 'success');

    for (const file of project.files) {
      await window.electronAPI.writeFile(`${project.projectName}/${file.path}`, file.content);
      addLog(`Wrote ${file.path}`, 'success');
    }

    return window.electronAPI.getAbsolutePath(project.projectName);
  };

  const runInstall = async (absolutePath: string): Promise<VerificationResult> => {
    setStatus('installing');
    const requestId = `npm-install-${Date.now()}`;
    currentCommandIdRef.current = requestId;
    addLog('Installing dependencies with npm install...', 'info');

    const result = await window.electronAPI.executeCommand('npm install', absolutePath, {
      requestId,
      timeoutMs: 10 * 60 * 1000
    });

    currentCommandIdRef.current = null;

    if (!result.success) {
      addLog(result.error || 'npm install failed.', 'error');
      setStatus('install_failed');
      return {
        success: false,
        stage: 'install',
        log: [result.error, result.stdout, result.stderr].filter(Boolean).join('\n')
      };
    }

    addLog('Dependencies installed successfully.', 'success');
    return {
      success: true,
      stage: 'install',
      log: result.stdout
    };
  };

  const runBuildVerification = async (project: GeneratedProject, absolutePath: string): Promise<VerificationResult> => {
    const packageFile = project.files.find((file) => file.path === 'package.json');
    if (!packageFile) {
      return { success: true, stage: 'build', log: 'No package.json found after validation.' };
    }

    const packageJson = JSON.parse(packageFile.content) as { scripts?: Record<string, string> };
    if (!packageJson.scripts?.build) {
      addLog('No build script found; skipping build verification.', 'warning');
      return { success: true, stage: 'build', log: 'No build script found.' };
    }

    setStatus('installing');
    const requestId = `npm-build-${Date.now()}`;
    currentCommandIdRef.current = requestId;
    addLog('Verifying generated project with npm run build...', 'info');

    const result = await window.electronAPI.executeCommand('npm run build', absolutePath, {
      requestId,
      timeoutMs: 10 * 60 * 1000
    });

    currentCommandIdRef.current = null;

    if (!result.success) {
      addLog(result.error || 'npm run build failed.', 'error');
      setStatus('install_failed');
      return {
        success: false,
        stage: 'build',
        log: [result.error, result.stdout, result.stderr].filter(Boolean).join('\n')
      };
    }

    addLog('Build verification completed successfully.', 'success');
    return {
      success: true,
      stage: 'build',
      log: result.stdout
    };
  };

  const verifyProject = async (project: GeneratedProject, absolutePath: string): Promise<VerificationResult> => {
    const installResult = await runInstall(absolutePath);
    if (!installResult.success) {
      return installResult;
    }

    return runBuildVerification(project, absolutePath);
  };

  const writeAndVerifyWithRepair = async (
    initialProject: GeneratedProject,
    originalPrompt: string
  ): Promise<LastProject> => {
    let project = initialProject;
    let absolutePath = await writeProjectFiles(project);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const verification = await verifyProject(project, absolutePath);
      if (verification.success) {
        return { project, absolutePath };
      }

      if (attempt === 3) {
        throw new Error(`${verification.stage} failed after repair attempts:\n${verification.log}`);
      }

      setStatus('generating');
      addLog(`Asking Ollama to repair project after ${verification.stage} failure...`, 'warning');
      project = await ollamaService.repairProject({
        originalPrompt,
        currentProject: project,
        failureStage: verification.stage,
        failureLog: verification.log
      });
      addLog(`Received repaired project JSON attempt ${attempt + 1}.`, 'success');

      setStatus('writing');
      absolutePath = await writeProjectFiles(project);
    }

    return { project, absolutePath };
  };

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isBusy(status)) {
      return;
    }

    if (!window.electronAPI) {
      setStatus('error');
      setLogs([]);
      addLog('Electron preload bridge is unavailable. Restart the desktop app.', 'error');
      return;
    }

    setLogs([]);
    setLastProject(null);
    setStatus('checking');

    try {
      addLog('Checking local Ollama connection...');
      await ollamaService.ensureModelAvailable();
      addLog('Ollama is running with qwen2.5-coder:7b.', 'success');

      setStatus('generating');
      addLog('Sending project requirements to Ollama...');
      const project = await ollamaService.generateProject(trimmedPrompt);
      addLog(`Received valid project JSON: ${project.projectName}`, 'success');
      addLog(`Validated ${project.files.length} generated files.`, 'success');

      setStatus('writing');
      addLog('Writing files to disk and verifying project...');
      const verifiedProject = await writeAndVerifyWithRepair(project, trimmedPrompt);
      setLastProject(verifiedProject);

      setStatus('complete');
      addLog(`Project is ready at ${verifiedProject.absolutePath}`, 'success');
    } catch (error) {
      currentCommandIdRef.current = null;
      setStatus('error');
      addLog(getErrorMessage(error), 'error');
    }
  };

  const handleRetryInstall = async () => {
    if (!lastProject || isBusy(status)) {
      return;
    }

    try {
      const verification = await verifyProject(lastProject.project, lastProject.absolutePath);
      if (verification.success) {
        setStatus('complete');
        addLog(`Project is ready at ${lastProject.absolutePath}`, 'success');
      }
    } catch (error) {
      currentCommandIdRef.current = null;
      setStatus('install_failed');
      addLog(getErrorMessage(error), 'error');
    }
  };

  const statusText: Record<GenerationStatus, string> = {
    idle: 'Ready',
    checking: 'Checking Ollama',
    generating: 'Generating JSON',
    writing: 'Writing files',
    installing: 'Installing dependencies',
    complete: 'Complete',
    install_failed: 'Install failed',
    error: 'Error'
  };

  const logColor: Record<LogType, string> = {
    info: 'text-cyan-200',
    success: 'text-emerald-300',
    warning: 'text-amber-300',
    error: 'text-red-300',
    stdout: 'text-zinc-200',
    stderr: 'text-amber-200'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border border-purple-500/25 bg-black/30 backdrop-blur-xl rounded-xl p-6 shadow-2xl shadow-purple-950/30">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Generate Project</h2>
              <p className="text-sm text-purple-200/65">
                Local model: qwen2.5-coder:7b via Ollama at localhost:11434
              </p>
            </div>
            <div className="rounded-md border border-purple-400/30 px-3 py-1 text-sm text-purple-100">
              {statusText[status]}
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => updatePrompt(event.target.value)}
            className="h-36 w-full resize-none rounded-lg border border-purple-500/30 bg-zinc-950/80 p-4 text-white outline-none transition focus:border-pink-400/70"
            placeholder="Describe the application you want to build. Example: A modern school website with courses, admissions, gallery, contact form, and responsive design."
            disabled={isBusy(status)}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isBusy(status)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-medium text-white transition hover:shadow-lg hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy(status) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Generate
            </button>

            {status === 'install_failed' && lastProject && (
              <button
                type="button"
                onClick={handleRetryInstall}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-5 py-3 font-medium text-amber-100 transition hover:bg-amber-500/20"
              >
                <RotateCcw className="h-4 w-4" />
                Retry npm install
              </button>
            )}
          </div>

          {status === 'complete' && lastProject && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
              <span>{lastProject.project.projectName} is ready at {lastProject.absolutePath}</span>
            </div>
          )}

          {(status === 'error' || status === 'install_failed') && (
            <div className="flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span>Generation stopped. Check the log below for the exact failure.</span>
            </div>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="h-80 overflow-y-auto rounded-xl border border-cyan-400/20 bg-zinc-950 p-4 font-mono text-sm shadow-inner">
          {logs.map((log) => (
            <div key={log.id} className={`${logColor[log.type]} mb-1 whitespace-pre-wrap`}>
              <span className="text-zinc-500">[{log.time}]</span> {log.message}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
