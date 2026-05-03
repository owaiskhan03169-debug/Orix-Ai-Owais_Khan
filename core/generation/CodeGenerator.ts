/**
 * Code Generator
 * 
 * Generates complete project code from project plans.
 */

import { ProjectPlan } from '../planning';
import { fileSystemService } from '../../services/fileSystem';
import {
  GenerationOptions,
  GenerationResult,
  GenerationProgress,
  FileGenerationResult,
  GenerationStatus
} from './types';
import * as configTemplates from './templates/configTemplates';
import * as reactTemplates from './templates/reactTemplates';

export class CodeGenerator {
  /**
   * Generate complete project from plan
   */
  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const { plan, outputDirectory, overwrite = false, dryRun = false, onProgress } = options;

    const filesGenerated: FileGenerationResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file system is available
    if (!fileSystemService.isAvailable() && !dryRun) {
      throw new Error('File system not available. Cannot generate files.');
    }

    // Update progress
    const updateProgress = (status: GenerationStatus, currentFile: string, completed: number) => {
      if (onProgress) {
        const progress: GenerationProgress = {
          status,
          currentFile,
          filesCompleted: completed,
          filesTotal: plan.generationOrder.length,
          percentage: Math.round((completed / plan.generationOrder.length) * 100),
          errors: [...errors],
          warnings: [...warnings]
        };
        onProgress(progress);
      }
    };

    try {
      // Phase 1: Preparing
      updateProgress('preparing', '', 0);

      // Create output directory
      if (!dryRun) {
        const dirResult = await fileSystemService.createDirectory(outputDirectory);
        if (!dirResult.success) {
          throw new Error(`Failed to create output directory: ${dirResult.error}`);
        }
      }

      // Phase 2: Generating files
      updateProgress('generating', '', 0);

      let completed = 0;

      // Generate configuration files
      const configFiles = await this.generateConfigFiles(plan, outputDirectory, dryRun);
      filesGenerated.push(...configFiles);
      completed += configFiles.length;
      updateProgress('generating', 'Configuration files', completed);

      // Generate source files
      const sourceFiles = await this.generateSourceFiles(plan, outputDirectory, dryRun);
      filesGenerated.push(...sourceFiles);
      completed += sourceFiles.length;
      updateProgress('generating', 'Source files', completed);

      // Generate component files
      const componentFiles = await this.generateComponentFiles(plan, outputDirectory, dryRun);
      filesGenerated.push(...componentFiles);
      completed += componentFiles.length;
      updateProgress('generating', 'Component files', completed);

      // Phase 3: Complete
      updateProgress('complete', '', completed);

      const totalTimeMs = Date.now() - startTime;
      const totalLines = filesGenerated.reduce((sum, f) => sum + f.linesGenerated, 0);

      return {
        success: errors.length === 0,
        outputDirectory,
        filesGenerated,
        totalFiles: filesGenerated.length,
        totalLines,
        totalTimeMs,
        errors,
        warnings
      };

    } catch (error) {
      updateProgress('error', '', 0);
      errors.push(error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        outputDirectory,
        filesGenerated,
        totalFiles: filesGenerated.length,
        totalLines: 0,
        totalTimeMs: Date.now() - startTime,
        errors,
        warnings
      };
    }
  }

  /**
   * Generate configuration files
   */
  private async generateConfigFiles(
    plan: ProjectPlan,
    outputDir: string,
    dryRun: boolean
  ): Promise<FileGenerationResult[]> {
    const results: FileGenerationResult[] = [];

    const configFiles = [
      { path: 'package.json', content: configTemplates.generatePackageJson(plan) },
      { path: 'tsconfig.json', content: configTemplates.generateTsConfig() },
      { path: 'vite.config.ts', content: configTemplates.generateViteConfig(plan) },
      { path: 'tailwind.config.js', content: configTemplates.generateTailwindConfig() },
      { path: 'postcss.config.js', content: configTemplates.generatePostCSSConfig() },
      { path: '.gitignore', content: configTemplates.generateGitIgnore() },
      { path: 'index.html', content: configTemplates.generateIndexHtml(plan) },
      { path: 'README.md', content: configTemplates.generateReadme(plan) }
    ];

    for (const file of configFiles) {
      const result = await this.generateFile(
        `${outputDir}/${file.path}`,
        file.content,
        dryRun
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Generate source files
   */
  private async generateSourceFiles(
    plan: ProjectPlan,
    outputDir: string,
    dryRun: boolean
  ): Promise<FileGenerationResult[]> {
    const results: FileGenerationResult[] = [];

    const sourceFiles = [
      { path: 'src/main.tsx', content: reactTemplates.generateMainTsx() },
      { path: 'src/App.tsx', content: reactTemplates.generateAppTsx(plan) },
      { path: 'src/index.css', content: reactTemplates.generateIndexCss() }
    ];

    for (const file of sourceFiles) {
      const result = await this.generateFile(
        `${outputDir}/${file.path}`,
        file.content,
        dryRun
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Generate component files
   */
  private async generateComponentFiles(
    plan: ProjectPlan,
    outputDir: string,
    dryRun: boolean
  ): Promise<FileGenerationResult[]> {
    const results: FileGenerationResult[] = [];

    // Generate layout components
    const layoutFiles = [
      { path: 'src/layouts/Layout.tsx', content: reactTemplates.generateLayoutComponent() }
    ];

    for (const file of layoutFiles) {
      const result = await this.generateFile(
        `${outputDir}/${file.path}`,
        file.content,
        dryRun
      );
      results.push(result);
    }

    // Generate common components
    const commonFiles = [
      { path: 'src/components/Header.tsx', content: reactTemplates.generateHeaderComponent() },
      { path: 'src/components/Navigation.tsx', content: reactTemplates.generateNavigationComponent(plan.routes) },
      { path: 'src/components/Footer.tsx', content: reactTemplates.generateFooterComponent() }
    ];

    for (const file of commonFiles) {
      const result = await this.generateFile(
        `${outputDir}/${file.path}`,
        file.content,
        dryRun
      );
      results.push(result);
    }

    // Generate page components
    for (const component of plan.components.filter(c => c.type === 'page')) {
      const content = reactTemplates.generatePageComponent(component.name);
      const result = await this.generateFile(
        `${outputDir}/${component.path}`,
        content,
        dryRun
      );
      results.push(result);
    }

    // Generate other components
    for (const component of plan.components.filter(c => c.type === 'functional')) {
      const content = reactTemplates.generateComponent(component);
      const result = await this.generateFile(
        `${outputDir}/${component.path}`,
        content,
        dryRun
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Generate a single file
   */
  private async generateFile(
    path: string,
    content: string,
    dryRun: boolean
  ): Promise<FileGenerationResult> {
    const startTime = Date.now();

    try {
      if (!dryRun) {
        const result = await fileSystemService.writeFile({
          path,
          content,
          overwrite: true
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      const lines = content.split('\n').length;

      return {
        path,
        success: true,
        content: dryRun ? content : undefined,
        linesGenerated: lines,
        timeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        path,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        linesGenerated: 0,
        timeMs: Date.now() - startTime
      };
    }
  }
}

// Export singleton instance
export const codeGenerator = new CodeGenerator();

// Made with Bob