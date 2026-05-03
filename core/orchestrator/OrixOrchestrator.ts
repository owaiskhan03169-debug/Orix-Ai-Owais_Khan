/**
 * ORIX Orchestrator
 * Main service that coordinates all ORIX-AI systems
 */

import { AIProviderManager, ProviderManagerConfig } from '../ai/AIProviderManager';
import { PromptAnalyzer } from '../understanding/PromptAnalyzer';
import { ProjectPlanner } from '../planning/ProjectPlanner';
import { CodeGenerator } from '../generation/CodeGenerator';
import { FileSystemService } from '../../services/fileSystem/FileSystemService';
import { TerminalService } from '../../services/terminal/TerminalService';
import { DebugService } from '../debugging/DebugService';
import { ExplanationService } from '../explanation/ExplanationService';

import { PromptUnderstanding } from '../understanding/types';
import { PlanningResult } from '../planning/types';
import { GenerationResult } from '../generation/types';
import { DebugSession } from '../debugging/types';
import { CodeExplanation, ExplanationRequest } from '../explanation/types';

export interface OrixConfig {
  aiProvider: ProviderManagerConfig;
  workspaceRoot: string;
  autoFix: boolean;
  verifyGeneration: boolean;
}

export interface ProjectGenerationRequest {
  prompt: string;
  outputPath: string;
  autoInstall?: boolean;
  autoRun?: boolean;
}

export interface ProjectGenerationResult {
  success: boolean;
  understanding?: PromptUnderstanding;
  plan?: PlanningResult;
  generation?: GenerationResult;
  debugSession?: DebugSession;
  error?: string;
  duration: number;
}

export class OrixOrchestrator {
  private aiManager: AIProviderManager;
  private understanding: PromptAnalyzer;
  private planning: ProjectPlanner;
  private generation: CodeGenerator;
  private fileSystem: FileSystemService;
  private terminal: TerminalService;
  private debug: DebugService;
  private explanation: ExplanationService;
  private config: OrixConfig;

  constructor(config: OrixConfig) {
    this.config = config;
    
    // Initialize services
    this.aiManager = new AIProviderManager();
    this.understanding = new PromptAnalyzer();
    this.planning = new ProjectPlanner();
    this.generation = new CodeGenerator();
    this.fileSystem = new FileSystemService();
    this.terminal = new TerminalService();
    this.debug = new DebugService();
    this.explanation = new ExplanationService();

    // Set AI provider
    this.aiManager.setProvider(config.aiProvider);
  }

  /**
   * Main workflow: Generate complete project from prompt
   */
  async generateProject(request: ProjectGenerationRequest): Promise<ProjectGenerationResult> {
    const startTime = Date.now();

    try {
      // Phase 1: Understand the prompt
      console.log('🔍 Understanding prompt...');
      const understanding = await this.understanding.analyze(request.prompt);
      
      if (!understanding.confidence || understanding.confidence.overall < 0.5) {
        return {
          success: false,
          error: 'Could not understand the prompt with sufficient confidence',
          duration: Date.now() - startTime
        };
      }

      // Phase 2: Create project plan
      console.log('📋 Creating project plan...');
      const plan = await this.planning.createPlan(understanding);

      // Phase 3: Generate code
      console.log('⚡ Generating code...');
      const generation = await this.generation.generate({
        plan: plan as any,
        outputDirectory: request.outputPath,
        overwrite: true
      });

      if (!generation.success) {
        return {
          success: false,
          understanding,
          plan,
          generation,
          error: 'Code generation failed',
          duration: Date.now() - startTime
        };
      }

      // Phase 4: Install dependencies (if requested)
      if (request.autoInstall) {
        console.log('📦 Installing dependencies...');
        await this.terminal.executeCommand({
          command: 'npm install',
          cwd: request.outputPath
        });
      }

      // Phase 5: Run project (if requested)
      if (request.autoRun) {
        console.log('🚀 Starting development server...');
        await this.terminal.executeCommand({
          command: 'npm run dev',
          cwd: request.outputPath
        });
      }

      // Phase 6: Verify and debug (if enabled)
      let debugSession: DebugSession | undefined;
      if (this.config.verifyGeneration && request.autoInstall) {
        console.log('🔧 Verifying build...');
        debugSession = await this.debug.runDebugCycle(
          request.outputPath,
          'npm run build',
          { autoFix: this.config.autoFix }
        );
      }

      return {
        success: true,
        understanding,
        plan,
        generation,
        debugSession,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Debug existing project
   */
  async debugProject(projectPath: string, command: string = 'npm run build'): Promise<DebugSession> {
    console.log('🐛 Starting debug session...');
    return await this.debug.runDebugCycle(projectPath, command, {
      autoFix: this.config.autoFix,
      verifyFixes: true,
      maxIterations: 5
    });
  }

  /**
   * Explain code
   */
  async explainCode(request: ExplanationRequest): Promise<CodeExplanation> {
    console.log('📖 Generating explanation...');
    return await this.explanation.explainCode(request);
  }

  /**
   * Analyze existing project
   */
  async analyzeProject(projectPath: string): Promise<{
    structure: any;
    dependencies: string[];
    issues: any[];
    recommendations: string[];
  }> {
    console.log('🔍 Analyzing project...');

    // Read package.json
    let dependencies: string[] = [];
    try {
      const packageJsonContent = await this.fileSystem.readFile({
        path: `${projectPath}/package.json`
      });
      const packageJson = JSON.parse(packageJsonContent);
      dependencies = Object.keys(packageJson.dependencies || {});
    } catch (err) {
      console.warn('Could not read package.json');
    }

    // Scan directory structure
    const structure = await this.fileSystem.scanDirectory(projectPath, true);

    // Detect issues
    const issues: any[] = [];
    const recommendations: string[] = [];

    // Check for common issues
    if (!dependencies.includes('typescript')) {
      recommendations.push('Consider adding TypeScript for better type safety');
    }

    if (!structure.files.some(f => f.includes('.gitignore'))) {
      issues.push({
        severity: 'medium',
        message: 'Missing .gitignore file',
        fix: 'Add .gitignore to exclude node_modules and build files'
      });
    }

    if (!structure.files.some(f => f.includes('README.md'))) {
      issues.push({
        severity: 'low',
        message: 'Missing README.md',
        fix: 'Add documentation for the project'
      });
    }

    return {
      structure,
      dependencies,
      issues,
      recommendations
    };
  }

  /**
   * Update AI provider configuration
   */
  updateAIProvider(config: ProviderManagerConfig): void {
    this.aiManager.setProvider(config);
  }

  /**
   * Get system status
   */
  getStatus(): {
    aiProvider: string;
    fileSystemAvailable: boolean;
    terminalAvailable: boolean;
    ready: boolean;
  } {
    const provider = this.aiManager.getCurrentProvider();
    
    return {
      aiProvider: provider?.constructor.name || 'None',
      fileSystemAvailable: this.fileSystem.isAvailable(),
      terminalAvailable: this.terminal.isAvailable(),
      ready: provider !== null && this.fileSystem.isAvailable()
    };
  }

  /**
   * Run health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    issues: string[];
  }> {
    const checks: Record<string, boolean> = {};
    const issues: string[] = [];

    // Check AI provider
    const provider = this.aiManager.getCurrentProvider();
    checks.aiProvider = provider !== null;
    if (!checks.aiProvider) {
      issues.push('No AI provider configured');
    }

    // Check file system
    checks.fileSystem = this.fileSystem.isAvailable();
    if (!checks.fileSystem) {
      issues.push('File system not available');
    }

    // Check terminal
    checks.terminal = this.terminal.isAvailable();
    if (!checks.terminal) {
      issues.push('Terminal not available');
    }

    // Determine overall status
    const allHealthy = Object.values(checks).every(v => v);
    const someHealthy = Object.values(checks).some(v => v);

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      checks,
      issues
    };
  }

  /**
   * Get configuration
   */
  getConfig(): OrixConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OrixConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.aiProvider) {
      this.updateAIProvider(updates.aiProvider);
    }
  }
}

// Made with Bob
