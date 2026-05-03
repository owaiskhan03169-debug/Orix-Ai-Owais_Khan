export interface GeneratedProjectFile {
  path: string;
  content: string;
}

export interface GeneratedProject {
  projectName: string;
  files: GeneratedProjectFile[];
}

export interface OllamaGenerateOptions {
  model?: string;
  timeoutMs?: number;
  onToken?: (token: string) => void;
}

export interface RepairProjectOptions extends OllamaGenerateOptions {
  originalPrompt: string;
  currentProject: GeneratedProject;
  failureStage: string;
  failureLog: string;
}

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

interface OllamaStreamChunk {
  message?: {
    content?: string;
  };
  done?: boolean;
  error?: string;
}

const DEFAULT_BASE_URL = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'qwen2.5-coder:7b';

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sanitizeProjectName(name: string): string {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (!sanitized) {
    throw new Error('AI response contains an invalid projectName.');
  }

  return sanitized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateFilePath(filePath: string): void {
  if (!filePath.trim()) {
    throw new Error('AI response contains an empty file path.');
  }

  if (
    filePath.startsWith('/') ||
    filePath.startsWith('\\') ||
    filePath.includes('..') ||
    filePath.includes('\\') ||
    /^[a-zA-Z]:/.test(filePath)
  ) {
    throw new Error(`Unsafe generated file path rejected: ${filePath}`);
  }

  const blockedSegments = new Set(['node_modules', '.git', 'dist', 'dist-electron']);
  const segments = filePath.split('/');
  if (segments.some((segment) => blockedSegments.has(segment))) {
    throw new Error(`Generated file path targets a blocked directory: ${filePath}`);
  }
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;

  if (candidate.startsWith('{') && candidate.endsWith('}')) {
    return candidate;
  }

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return candidate.slice(firstBrace, lastBrace + 1);
  }

  throw new Error('Ollama response did not contain a JSON object.');
}

export function parseGeneratedProject(raw: string): GeneratedProject {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(raw));
  } catch (error) {
    throw new Error(`Ollama returned invalid JSON: ${toErrorMessage(error)}`);
  }

  if (!isRecord(parsed)) {
    throw new Error('AI response must be a JSON object.');
  }

  if (typeof parsed.projectName !== 'string') {
    throw new Error('AI response is missing string field "projectName".');
  }

  if (!Array.isArray(parsed.files)) {
    throw new Error('AI response is missing array field "files".');
  }

  const projectName = sanitizeProjectName(parsed.projectName);
  const files = parsed.files.map((entry, index): GeneratedProjectFile => {
    if (!isRecord(entry)) {
      throw new Error(`File entry ${index + 1} must be an object.`);
    }

    if (typeof entry.path !== 'string') {
      throw new Error(`File entry ${index + 1} is missing string field "path".`);
    }

    if (typeof entry.content !== 'string') {
      throw new Error(`File entry ${index + 1} is missing string field "content".`);
    }

    validateFilePath(entry.path);

    return {
      path: entry.path,
      content: entry.content
    };
  });

  if (files.length === 0) {
    throw new Error('AI response did not include any files.');
  }

  if (!files.some((file) => file.path === 'package.json')) {
    throw new Error('Generated project must include package.json so npm install can run.');
  }

  if (files.length < 2) {
    throw new Error('Generated project must include package.json and at least one source file.');
  }

  const packageFile = files.find((file) => file.path === 'package.json');
  if (packageFile) {
    let packageJson: unknown;
    try {
      packageJson = JSON.parse(packageFile.content);
    } catch (error) {
      throw new Error(`Generated package.json is invalid JSON: ${toErrorMessage(error)}`);
    }

    if (!isRecord(packageJson) || typeof packageJson.name !== 'string') {
      throw new Error('Generated package.json must include a string "name" field.');
    }

    if (!isRecord(packageJson.scripts)) {
      throw new Error('Generated package.json must include a "scripts" object.');
    }

    const dependencies = isRecord(packageJson.dependencies) ? packageJson.dependencies : {};
    const devDependencies = isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {};
    const usesReact = 'react' in dependencies || 'react' in devDependencies || files.some((file) => file.path.endsWith('.tsx'));
    const usesVite = 'vite' in dependencies || 'vite' in devDependencies || Object.values(packageJson.scripts).some((script) => (
      typeof script === 'string' && script.includes('vite')
    ));

    if (usesVite) {
      const rootIndex = files.find((file) => file.path === 'index.html');
      if (!rootIndex) {
        throw new Error('Vite projects must include index.html at the project root, not inside src.');
      }

      if (files.some((file) => file.path === 'src/index.html')) {
        throw new Error('Vite projects must not place index.html inside src/. Move it to project root.');
      }

      if (!rootIndex.content.includes('/src/main.tsx') && !rootIndex.content.includes('/src/main.jsx') && usesReact) {
        throw new Error('Vite React index.html must load the React entry with a module script such as /src/main.tsx.');
      }
    }

    if (usesReact && !files.some((file) => file.path === 'src/main.tsx' || file.path === 'src/main.jsx')) {
      throw new Error('React projects must include src/main.tsx or src/main.jsx.');
    }
  }

  return {
    projectName,
    files
  };
}

function summarizeFiles(files: GeneratedProjectFile[]): string {
  return files
    .map((file) => {
      const content = file.content.length > 5000
        ? `${file.content.slice(0, 5000)}\n/* truncated */`
        : file.content;

      return `FILE: ${file.path}\n${content}`;
    })
    .join('\n\n');
}

function buildProjectPrompt(userPrompt: string): string {
  return `Create a complete npm-based software project from this request:

${userPrompt}

Return ONLY valid JSON. No markdown. No code fences. No prose before or after the JSON.

The JSON schema is:
{
  "projectName": "kebab-case-project-name",
  "files": [
    {
      "path": "package.json",
      "content": "file contents"
    }
  ]
}

Rules:
- Include a real package.json with installable dependencies and scripts.
- Prefer a Vite + React + TypeScript project unless the user explicitly asks for another npm framework.
- Include all source, config, and styling files needed to run the project.
- For Vite apps, index.html must be at the project root and must include <script type="module" src="/src/main.tsx"></script> or the correct JSX equivalent.
- Do not put index.html inside src/.
- Include a build script for Vite/React projects.
- File paths must be relative, use forward slashes, and never include .., node_modules, dist, or absolute paths.
- JSON string contents must be escaped correctly.
- Do not include explanations, comments outside files, or placeholder files.`;
}

export class OllamaService {
  constructor(
    private readonly baseUrl = DEFAULT_BASE_URL,
    private readonly model = DEFAULT_OLLAMA_MODEL
  ) {}

  async testConnection(timeoutMs = 8000): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout('/api/tags', {
        method: 'GET'
      }, timeoutMs);

      return response.ok;
    } catch {
      return false;
    }
  }

  async ensureModelAvailable(model = this.model, timeoutMs = 10000): Promise<void> {
    const response = await this.fetchWithTimeout('/api/tags', {
      method: 'GET'
    }, timeoutMs);

    if (!response.ok) {
      throw new Error(`Ollama is not reachable at ${this.baseUrl}. Start Ollama and try again.`);
    }

    const data = await response.json() as { models?: Array<{ name?: string }> };
    const names = data.models?.map((entry) => entry.name).filter(Boolean) ?? [];

    if (!names.includes(model)) {
      throw new Error(`Ollama model "${model}" is not installed. Run: ollama pull ${model}`);
    }
  }

  async generateProject(prompt: string, options: OllamaGenerateOptions = {}): Promise<GeneratedProject> {
    let repairNote = '';
    let lastError: unknown;
    let previousRaw = '';

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const raw = await this.generateRawProjectJson(`${prompt}${repairNote}`, options);
      previousRaw = raw;

      try {
        return parseGeneratedProject(raw);
      } catch (error) {
        lastError = error;
        repairNote = `

The previous response was rejected before writing files.
Validation error: ${toErrorMessage(error)}
Invalid response:
${previousRaw.slice(0, 6000)}

Return a corrected, complete project JSON. package.json content must itself be valid JSON, at least one source file must be included, and Vite index.html must be at the project root.`;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  async repairProject(options: RepairProjectOptions): Promise<GeneratedProject> {
    const prompt = `Repair this generated npm project.

Original user request:
${options.originalPrompt}

Failure stage:
${options.failureStage}

Failure log:
${options.failureLog.slice(0, 12000)}

Current generated files:
${summarizeFiles(options.currentProject.files)}

Return ONLY the full corrected project JSON using the same schema:
{
  "projectName": "${options.currentProject.projectName}",
  "files": [
    { "path": "package.json", "content": "..." }
  ]
}

Rules:
- Return the complete corrected project, not a patch.
- Keep projectName exactly "${options.currentProject.projectName}".
- Remove broken file layout choices. For Vite, index.html belongs at project root and must load /src/main.tsx or /src/main.jsx.
- Ensure npm install and npm run build can pass.
- No markdown, no explanations.`;

    const repaired = await this.generateProject(prompt, options);
    return {
      ...repaired,
      projectName: options.currentProject.projectName
    };
  }

  async generateRawProjectJson(prompt: string, options: OllamaGenerateOptions = {}): Promise<string> {
    const model = options.model ?? this.model;
    await this.ensureModelAvailable(model, options.timeoutMs ?? 15000);

    if (options.onToken) {
      return this.streamChat(buildProjectPrompt(prompt), {
        ...options,
        model,
        onToken: options.onToken
      });
    }

    const response = await this.fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: [
          {
            role: 'system',
            content: 'You generate complete npm projects. You must return only valid JSON matching the requested schema.'
          },
          {
            role: 'user',
            content: buildProjectPrompt(prompt)
          }
        ],
        options: {
          temperature: 0.1,
          num_ctx: 8192
        }
      })
    }, options.timeoutMs ?? 10 * 60 * 1000);

    if (!response.ok) {
      throw new Error(`Ollama generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaChatResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    const content = data.message?.content;
    if (!content) {
      throw new Error('Ollama returned an empty response.');
    }

    return content;
  }

  async generateText(prompt: string, options: OllamaGenerateOptions = {}): Promise<string> {
    const model = options.model ?? this.model;
    await this.ensureModelAvailable(model, options.timeoutMs ?? 15000);

    if (options.onToken) {
      return this.streamChat(prompt, {
        ...options,
        model,
        onToken: options.onToken
      });
    }

    const response = await this.fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.2,
          num_ctx: 8192
        }
      })
    }, options.timeoutMs ?? 5 * 60 * 1000);

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaChatResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    return data.message?.content ?? '';
  }

  private async streamChat(prompt: string, options: Required<Pick<OllamaGenerateOptions, 'onToken'>> & OllamaGenerateOptions): Promise<string> {
    const response = await this.fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model ?? this.model,
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.1,
          num_ctx: 8192
        }
      })
    }, options.timeoutMs ?? 10 * 60 * 1000);

    if (!response.ok || !response.body) {
      throw new Error(`Ollama stream failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }

        const chunk = JSON.parse(trimmed) as OllamaStreamChunk;
        if (chunk.error) {
          throw new Error(chunk.error);
        }

        const token = chunk.message?.content ?? '';
        if (token) {
          fullText += token;
          options.onToken(token);
        }
      }
    }

    return fullText;
  }

  private fetchWithTimeout(pathname: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);

    return fetch(`${this.baseUrl}${pathname}`, {
      ...init,
      signal: controller.signal
    }).finally(() => window.clearTimeout(timer));
  }
}

export const ollamaService = new OllamaService();

export async function generateWithOllama(prompt: string): Promise<string> {
  return ollamaService.generateText(prompt);
}
