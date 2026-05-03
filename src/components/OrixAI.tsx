import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Bug,
  CheckCircle2,
  Code2,
  Loader2,
  Play,
  Settings,
  Sparkles,
  Terminal
} from 'lucide-react';
import { PromptInput } from './PromptInput/PromptInput';
import { DEFAULT_OLLAMA_MODEL, ollamaService } from '../services/ollamaService';
import { useAIStore } from '../stores/useAIStore';

type View = 'home' | 'generate' | 'debug' | 'explain' | 'settings';
type WorkStatus = 'idle' | 'running' | 'complete' | 'error';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const OrixAI: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [prompt, setPrompt] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-white">
      <header className="border-b border-purple-500/20 bg-black/25 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50" />
                <Sparkles className="relative h-8 w-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  ORIX-AI
                </h1>
                <p className="text-xs text-purple-200/60">Local AI software generation with Ollama</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              <NavButton icon={<Sparkles className="h-4 w-4" />} label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
              <NavButton icon={<Code2 className="h-4 w-4" />} label="Generate" active={currentView === 'generate'} onClick={() => setCurrentView('generate')} />
              <NavButton icon={<Bug className="h-4 w-4" />} label="Debug" active={currentView === 'debug'} onClick={() => setCurrentView('debug')} />
              <NavButton icon={<BookOpen className="h-4 w-4" />} label="Explain" active={currentView === 'explain'} onClick={() => setCurrentView('explain')} />
              <NavButton icon={<Settings className="h-4 w-4" />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {currentView === 'home' && <HomeView onStart={() => setCurrentView('generate')} />}
        {currentView === 'generate' && <PromptInput initialPrompt={prompt} onPromptChange={setPrompt} />}
        {currentView === 'debug' && <DebugView />}
        {currentView === 'explain' && <ExplainView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      <footer className="mt-12 border-t border-purple-500/20 bg-black/25 py-4 text-center text-sm text-purple-200/50">
        ORIX-AI uses your local Ollama instance. Generated files are written under generated-projects.
      </footer>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
      active
        ? 'border border-purple-400/50 bg-purple-500/20 text-purple-100'
        : 'text-purple-200/65 hover:bg-purple-500/10 hover:text-purple-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const HomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="mx-auto max-w-5xl">
    <div className="mb-10 text-center">
      <h2 className="mb-4 text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-200 bg-clip-text text-transparent">
        Build real projects locally
      </h2>
      <p className="text-xl text-purple-100/75">
        ORIX-AI turns a prompt into files on disk, installs dependencies, and keeps the log visible.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-medium text-white transition hover:shadow-lg hover:shadow-purple-500/30"
      >
        <Code2 className="h-4 w-4" />
        Open Generator
      </button>
    </div>

    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FeatureCard icon={<Code2 className="h-7 w-7" />} title="Project Generation" description="Strict JSON output is parsed, validated, and written as real files." />
      <FeatureCard icon={<Terminal className="h-7 w-7" />} title="Live Installs" description="npm install runs through Electron IPC with streamed stdout and stderr." />
      <FeatureCard icon={<Bug className="h-7 w-7" />} title="Debug Assist" description="Paste build errors or run a generated project command and ask Ollama for fixes." />
      <FeatureCard icon={<BookOpen className="h-7 w-7" />} title="Code Explanation" description="Use the local model to explain pasted code at the level you choose." />
    </div>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="rounded-xl border border-purple-500/20 bg-black/25 p-6 shadow-xl shadow-purple-950/20 transition hover:border-purple-400/40">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
    <p className="text-purple-100/65">{description}</p>
  </div>
);

const DebugView: React.FC = () => {
  const [projectFolder, setProjectFolder] = useState('');
  const [diagnosticInput, setDiagnosticInput] = useState('');
  const [status, setStatus] = useState<WorkStatus>('idle');
  const [output, setOutput] = useState('');
  const commandIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!window.electronAPI?.onCommandOutput) {
      return;
    }

    return window.electronAPI.onCommandOutput((event) => {
      if (event.requestId !== commandIdRef.current) {
        return;
      }
      setOutput((previous) => `${previous}${event.chunk}`);
    });
  }, []);

  const analyzeWithOllama = async () => {
    if (!diagnosticInput.trim()) {
      setOutput('Paste an error log or code snippet before asking for a diagnosis.');
      setStatus('error');
      return;
    }

    setStatus('running');
    setOutput('');

    try {
      const response = await ollamaService.generateText(
        `You are debugging a local generated project. Explain the root cause and provide concrete code or command fixes.\n\nInput:\n${diagnosticInput}`,
        {
          onToken: (token) => setOutput((previous) => `${previous}${token}`)
        }
      );
      setOutput((previous) => previous || response);
      setStatus('complete');
    } catch (error) {
      setOutput(getErrorMessage(error));
      setStatus('error');
    }
  };

  const runBuild = async () => {
    if (!projectFolder.trim()) {
      setOutput('Enter a generated project folder name, for example school-website.');
      setStatus('error');
      return;
    }

    setStatus('running');
    setOutput('');

    try {
      const absolutePath = await window.electronAPI.getAbsolutePath(projectFolder.trim());
      const requestId = `debug-build-${Date.now()}`;
      commandIdRef.current = requestId;
      const result = await window.electronAPI.executeCommand('npm run build', absolutePath, {
        requestId,
        timeoutMs: 5 * 60 * 1000
      });
      commandIdRef.current = null;
      setStatus(result.success ? 'complete' : 'error');
    } catch (error) {
      commandIdRef.current = null;
      setOutput(getErrorMessage(error));
      setStatus('error');
    }
  };

  return (
    <ToolPanel title="Debug & Fix" subtitle="Run real project commands or ask Ollama to diagnose pasted errors.">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <input
          value={projectFolder}
          onChange={(event) => setProjectFolder(event.target.value)}
          className="rounded-lg border border-red-400/25 bg-zinc-950/80 px-4 py-3 text-white outline-none focus:border-red-300/60"
          placeholder="generated project folder name"
        />
        <button type="button" onClick={runBuild} disabled={status === 'running'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 font-medium text-white disabled:opacity-50">
          {status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
          Run npm build
        </button>
      </div>

      <textarea
        value={diagnosticInput}
        onChange={(event) => setDiagnosticInput(event.target.value)}
        className="mt-4 h-36 w-full resize-none rounded-lg border border-red-400/25 bg-zinc-950/80 p-4 text-white outline-none focus:border-red-300/60"
        placeholder="Paste an error log, stack trace, or code snippet for Ollama to analyze."
      />

      <button type="button" onClick={analyzeWithOllama} disabled={status === 'running'} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-medium text-white disabled:opacity-50">
        {status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
        Analyze with Ollama
      </button>

      <OutputBlock status={status} output={output} />
    </ToolPanel>
  );
};

const ExplainView: React.FC = () => {
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<WorkStatus>('idle');
  const [explanation, setExplanation] = useState('');

  const explainCode = async () => {
    if (!code.trim()) {
      setExplanation('Paste code before requesting an explanation.');
      setStatus('error');
      return;
    }

    setStatus('running');
    setExplanation('');

    try {
      const response = await ollamaService.generateText(
        `Explain this code for a ${level} developer. Cover purpose, flow, important APIs, risks, and practical improvements.\n\n${code}`,
        {
          onToken: (token) => setExplanation((previous) => `${previous}${token}`)
        }
      );
      setExplanation((previous) => previous || response);
      setStatus('complete');
    } catch (error) {
      setExplanation(getErrorMessage(error));
      setStatus('error');
    }
  };

  return (
    <ToolPanel title="Code Explanation" subtitle="Local explanations powered by qwen2.5-coder:7b.">
      <div className="mb-4 flex flex-wrap gap-2">
        {(['beginner', 'intermediate', 'advanced'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLevel(option)}
            className={`rounded-lg border px-4 py-2 text-sm capitalize transition ${
              level === option ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100' : 'border-blue-400/25 bg-blue-500/10 text-blue-100/70'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="h-48 w-full resize-none rounded-lg border border-blue-400/25 bg-zinc-950/80 p-4 font-mono text-sm text-white outline-none focus:border-cyan-300/60"
        placeholder="Paste code here."
      />

      <button type="button" onClick={explainCode} disabled={status === 'running'} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 font-medium text-white disabled:opacity-50">
        {status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
        Explain Code
      </button>

      <OutputBlock status={status} output={explanation} />
    </ToolPanel>
  );
};

const SettingsView: React.FC = () => {
  const { currentProvider, setProvider } = useAIStore();
  const [status, setStatus] = useState<WorkStatus>('idle');
  const [message, setMessage] = useState('');
  const [root, setRoot] = useState('');

  useEffect(() => {
    window.electronAPI?.getGeneratedRoot().then(setRoot).catch(() => setRoot('Unavailable'));
  }, []);

  const testOllama = async () => {
    setStatus('running');
    setMessage('Checking Ollama...');

    try {
      await ollamaService.ensureModelAvailable();
      setStatus('complete');
      setMessage(`Connected to Ollama with ${DEFAULT_OLLAMA_MODEL}.`);
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <ToolPanel title="Settings" subtitle="Runtime settings for the local generation engine.">
      <div className="space-y-4">
        <SettingRow title="AI Provider" description="Generation uses the local Ollama path.">
          <select
            value={currentProvider}
            onChange={(event) => setProvider(event.target.value as typeof currentProvider)}
            className="rounded-lg border border-purple-500/30 bg-zinc-950 px-4 py-2 text-white outline-none"
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="openai">OpenAI (not used by generator)</option>
            <option value="claude">Claude (not used by generator)</option>
            <option value="watsonx">watsonx (not used by generator)</option>
          </select>
        </SettingRow>

        <SettingRow title="Ollama Model" description="Required local model for project generation.">
          <span className="font-mono text-sm text-purple-100">{DEFAULT_OLLAMA_MODEL}</span>
        </SettingRow>

        <SettingRow title="Generated Projects" description="All writes are constrained to this folder.">
          <span className="max-w-md break-all font-mono text-sm text-purple-100">{root || 'Loading...'}</span>
        </SettingRow>

        <button type="button" onClick={testOllama} disabled={status === 'running'} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-3 font-medium text-white disabled:opacity-50">
          {status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Test Ollama
        </button>

        {message && <OutputBlock status={status} output={message} />}
      </div>
    </ToolPanel>
  );
};

interface ToolPanelProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ title, subtitle, children }) => (
  <div className="mx-auto max-w-5xl rounded-xl border border-purple-500/20 bg-black/25 p-6 shadow-2xl shadow-purple-950/25">
    <div className="mb-5">
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-purple-100/60">{subtitle}</p>
    </div>
    {children}
  </div>
);

interface OutputBlockProps {
  status: WorkStatus;
  output: string;
}

const OutputBlock: React.FC<OutputBlockProps> = ({ status, output }) => {
  if (!output) {
    return null;
  }

  const border = status === 'error' ? 'border-red-400/30' : status === 'complete' ? 'border-emerald-400/30' : 'border-cyan-400/20';
  const Icon = status === 'error' ? AlertTriangle : status === 'complete' ? CheckCircle2 : Terminal;

  return (
    <div className={`mt-4 rounded-lg border ${border} bg-zinc-950/90 p-4`}>
      <div className="mb-2 flex items-center gap-2 text-sm text-purple-100/70">
        <Icon className="h-4 w-4" />
        Output
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap font-mono text-sm text-zinc-100">{output}</pre>
    </div>
  );
};

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ title, description, children }) => (
  <div className="flex flex-col gap-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h3 className="font-medium text-white">{title}</h3>
      <p className="text-sm text-purple-100/55">{description}</p>
    </div>
    {children}
  </div>
);
