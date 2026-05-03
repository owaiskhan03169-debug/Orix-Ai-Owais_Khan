/**
 * Project Planner
 * 
 * Creates detailed project plans from prompt understanding.
 */

import { PromptUnderstanding } from '../understanding';
import {
  ProjectPlan,
  PlanningContext,
  PlanningResult,
  ComponentDefinition,
  RouteDefinition,
  DependencyDefinition,
  FileEntry,
  FolderEntry
} from './types';
import { getBaseFolderStructure, getCommonDependencies } from './templates';

export class ProjectPlanner {
  /**
   * Create a complete project plan from understanding
   */
  async createPlan(
    understanding: PromptUnderstanding,
    context?: PlanningContext
  ): Promise<PlanningResult> {
    const startTime = Date.now();

    // Generate project name
    const projectName = this.generateProjectName(understanding);

    // Get base folder structure
    const rootFolder = getBaseFolderStructure(understanding.projectType);

    // Plan components
    const components = this.planComponents(understanding, rootFolder);

    // Plan routes
    const routes = this.planRoutes(understanding, components);

    // Plan dependencies
    const dependencies = this.planDependencies(understanding);

    // Generate file tree
    const fileTree = this.generateFileTree(rootFolder, components);

    // Determine generation order
    const generationOrder = this.determineGenerationOrder(fileTree, components);

    // Calculate estimates
    const totalLines = this.calculateTotalLines(fileTree);
    const estimatedGenerationTime = this.estimateGenerationTime(fileTree.length);

    // Build the plan
    const plan: ProjectPlan = {
      id: `plan-${Date.now()}`,
      name: projectName,
      description: understanding.originalPrompt,
      createdAt: Date.now(),
      understanding,
      rootFolder,
      fileTree,
      components,
      routes,
      apis: [],
      models: [],
      dependencies,
      buildConfig: {
        entry: '/src/main.tsx',
        output: '/dist',
        publicPath: '/',
        devServer: {
          port: 5173,
          host: 'localhost',
          hot: true
        },
        optimization: {
          minify: true,
          splitChunks: true
        }
      },
      generationOrder,
      estimatedGenerationTime,
      totalFiles: fileTree.length,
      totalComponents: components.length,
      totalRoutes: routes.length,
      totalLines
    };

    // Generate warnings and suggestions
    const warnings = this.generateWarnings(plan);
    const suggestions = this.generateSuggestions(plan);

    const processingTime = Date.now() - startTime;

    return {
      plan,
      warnings,
      suggestions,
      estimatedDuration: understanding.estimatedDuration
    };
  }

  /**
   * Generate project name from understanding
   */
  private generateProjectName(understanding: PromptUnderstanding): string {
    const { projectType, businessDomain } = understanding;
    
    if (businessDomain) {
      return `${businessDomain}-${projectType}`;
    }
    
    // Extract key words from prompt
    const words = understanding.originalPrompt
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !['build', 'create', 'make', 'with'].includes(w))
      .slice(0, 3);
    
    return words.join('-') || `my-${projectType}`;
  }

  /**
   * Plan components based on understanding
   */
  private planComponents(
    understanding: PromptUnderstanding,
    rootFolder: FolderEntry
  ): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];

    // Add layout components
    components.push({
      name: 'Layout',
      path: '/src/layouts/Layout.tsx',
      type: 'layout',
      props: [
        {
          name: 'children',
          type: 'React.ReactNode',
          required: true,
          description: 'Page content'
        }
      ],
      state: [],
      hooks: [],
      children: ['Header', 'Footer'],
      description: 'Main layout wrapper',
      complexity: 3
    });

    // Add header component
    components.push({
      name: 'Header',
      path: '/src/components/Header.tsx',
      type: 'functional',
      props: [],
      state: [],
      hooks: [],
      children: ['Navigation'],
      description: 'Site header with navigation',
      complexity: 4
    });

    // Add navigation if needed
    if (understanding.features.some(f => f.name === 'navigation')) {
      components.push({
        name: 'Navigation',
        path: '/src/components/Navigation.tsx',
        type: 'functional',
        props: [],
        state: [
          {
            name: 'isOpen',
            type: 'boolean',
            initial: 'false',
            description: 'Mobile menu state'
          }
        ],
        hooks: ['useState'],
        children: [],
        description: 'Navigation menu',
        complexity: 5
      });
    }

    // Add footer component
    components.push({
      name: 'Footer',
      path: '/src/components/Footer.tsx',
      type: 'functional',
      props: [],
      state: [],
      hooks: [],
      children: [],
      description: 'Site footer',
      complexity: 2
    });

    // Add page components based on estimated pages
    for (let i = 0; i < understanding.estimatedPages; i++) {
      const pageName = this.generatePageName(i, understanding);
      components.push({
        name: pageName,
        path: `/src/pages/${pageName}.tsx`,
        type: 'page',
        props: [],
        state: [],
        hooks: [],
        children: [],
        description: `${pageName} page`,
        complexity: 5
      });
    }

    // Add feature-specific components
    for (const feature of understanding.features) {
      const featureComponents = this.generateFeatureComponents(feature.name);
      components.push(...featureComponents);
    }

    return components;
  }

  /**
   * Generate page name
   */
  private generatePageName(index: number, understanding: PromptUnderstanding): string {
    const commonPages = ['Home', 'About', 'Contact', 'Services', 'Products', 'Blog'];
    
    if (index < commonPages.length) {
      return commonPages[index];
    }
    
    return `Page${index + 1}`;
  }

  /**
   * Generate components for a feature
   */
  private generateFeatureComponents(featureName: string): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];

    switch (featureName) {
      case 'forms':
        components.push({
          name: 'ContactForm',
          path: '/src/components/ContactForm.tsx',
          type: 'functional',
          props: [],
          state: [
            {
              name: 'formData',
              type: 'FormData',
              initial: '{}',
              description: 'Form field values'
            },
            {
              name: 'isSubmitting',
              type: 'boolean',
              initial: 'false',
              description: 'Submission state'
            }
          ],
          hooks: ['useState', 'useForm'],
          children: [],
          description: 'Contact form component',
          complexity: 6
        });
        break;

      case 'search':
        components.push({
          name: 'SearchBar',
          path: '/src/components/SearchBar.tsx',
          type: 'functional',
          props: [
            {
              name: 'onSearch',
              type: '(query: string) => void',
              required: true,
              description: 'Search callback'
            }
          ],
          state: [
            {
              name: 'query',
              type: 'string',
              initial: '""',
              description: 'Search query'
            }
          ],
          hooks: ['useState', 'useDebounce'],
          children: [],
          description: 'Search input component',
          complexity: 5
        });
        break;

      case 'dashboard':
        components.push({
          name: 'Dashboard',
          path: '/src/components/Dashboard.tsx',
          type: 'functional',
          props: [],
          state: [
            {
              name: 'data',
              type: 'DashboardData',
              initial: 'null',
              description: 'Dashboard data'
            }
          ],
          hooks: ['useState', 'useEffect'],
          children: ['StatCard', 'Chart'],
          description: 'Dashboard overview',
          complexity: 8
        });
        break;
    }

    return components;
  }

  /**
   * Plan routes based on components
   */
  private planRoutes(
    understanding: PromptUnderstanding,
    components: ComponentDefinition[]
  ): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    // Get page components
    const pages = components.filter(c => c.type === 'page');

    // Create routes for each page
    pages.forEach((page, index) => {
      const path = index === 0 ? '/' : `/${page.name.toLowerCase()}`;
      
      routes.push({
        path,
        component: page.name,
        exact: true,
        protected: false,
        layout: 'Layout',
        title: page.name,
        description: `${page.name} page route`
      });
    });

    return routes;
  }

  /**
   * Plan project dependencies
   */
  private planDependencies(understanding: PromptUnderstanding): DependencyDefinition[] {
    const dependencies: DependencyDefinition[] = [];

    // Add common dependencies
    const common = getCommonDependencies(understanding.projectType);
    common.forEach(dep => {
      dependencies.push({
        name: dep,
        version: 'latest',
        type: 'dependency',
        reason: 'Core dependency',
        required: true
      });
    });

    // Add technology-specific dependencies
    understanding.technologies.forEach(tech => {
      if (!common.includes(tech.name.toLowerCase())) {
        dependencies.push({
          name: tech.name.toLowerCase(),
          version: 'latest',
          type: 'dependency',
          reason: tech.reason,
          required: tech.required
        });
      }
    });

    // Add feature-specific dependencies
    understanding.features.forEach(feature => {
      const featureDeps = this.getFeatureDependencies(feature.name);
      dependencies.push(...featureDeps);
    });

    // Add state management
    if (understanding.complexity !== 'simple') {
      dependencies.push({
        name: 'zustand',
        version: 'latest',
        type: 'dependency',
        reason: 'State management',
        required: true
      });
    }

    // Add routing
    if (understanding.estimatedPages > 1) {
      dependencies.push({
        name: 'react-router-dom',
        version: 'latest',
        type: 'dependency',
        reason: 'Client-side routing',
        required: true
      });
    }

    return dependencies;
  }

  /**
   * Get dependencies for a feature
   */
  private getFeatureDependencies(featureName: string): DependencyDefinition[] {
    const deps: DependencyDefinition[] = [];

    switch (featureName) {
      case 'forms':
        deps.push({
          name: 'react-hook-form',
          version: 'latest',
          type: 'dependency',
          reason: 'Form handling',
          required: false
        });
        break;

      case 'authentication':
        deps.push({
          name: 'jwt-decode',
          version: 'latest',
          type: 'dependency',
          reason: 'JWT token handling',
          required: false
        });
        break;

      case 'dashboard':
        deps.push({
          name: 'recharts',
          version: 'latest',
          type: 'dependency',
          reason: 'Data visualization',
          required: false
        });
        break;
    }

    return deps;
  }

  /**
   * Generate flat file tree
   */
  private generateFileTree(
    folder: FolderEntry,
    components: ComponentDefinition[]
  ): string[] {
    const files: string[] = [];

    // Add folder files
    folder.files.forEach(file => files.push(file.path));

    // Add component files
    components.forEach(comp => files.push(comp.path));

    // Recursively add subfolder files
    folder.subfolders.forEach(subfolder => {
      files.push(...this.generateFileTree(subfolder, []));
    });

    return files.sort();
  }

  /**
   * Determine file generation order
   */
  private determineGenerationOrder(
    fileTree: string[],
    components: ComponentDefinition[]
  ): string[] {
    // Priority order:
    // 1. Config files
    // 2. Type definitions
    // 3. Utilities
    // 4. Components (by complexity)
    // 5. Pages
    // 6. Entry points

    const order: string[] = [];

    // Config files first
    order.push(...fileTree.filter(f => 
      f.includes('config') || f.includes('package.json') || f.includes('tsconfig')
    ));

    // Type definitions
    order.push(...fileTree.filter(f => f.includes('/types/')));

    // Utilities
    order.push(...fileTree.filter(f => f.includes('/utils/')));

    // Components by complexity (simple first)
    const sortedComponents = [...components].sort((a, b) => a.complexity - b.complexity);
    sortedComponents.forEach(comp => {
      if (!order.includes(comp.path)) {
        order.push(comp.path);
      }
    });

    // Remaining files
    fileTree.forEach(file => {
      if (!order.includes(file)) {
        order.push(file);
      }
    });

    return order;
  }

  /**
   * Calculate total lines of code
   */
  private calculateTotalLines(fileTree: string[]): number {
    // Rough estimate: 50 lines per file on average
    return fileTree.length * 50;
  }

  /**
   * Estimate generation time
   */
  private estimateGenerationTime(fileCount: number): number {
    // Estimate: 2 seconds per file
    return fileCount * 2000;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(plan: ProjectPlan): string[] {
    const warnings: string[] = [];

    if (plan.totalFiles > 50) {
      warnings.push('Large project detected. Generation may take several minutes.');
    }

    if (plan.understanding.complexity === 'enterprise') {
      warnings.push('Enterprise complexity requires careful planning and testing.');
    }

    if (plan.dependencies.length > 20) {
      warnings.push('Many dependencies detected. Consider bundle size optimization.');
    }

    return warnings;
  }

  /**
   * Generate suggestions
   */
  private generateSuggestions(plan: ProjectPlan): string[] {
    const suggestions: string[] = [];

    if (plan.understanding.responsive) {
      suggestions.push('Consider mobile-first design approach');
    }

    if (plan.understanding.darkMode) {
      suggestions.push('Implement CSS variables for easy theme switching');
    }

    if (plan.totalComponents > 10) {
      suggestions.push('Use component composition for better reusability');
    }

    suggestions.push('Add error boundaries for better error handling');
    suggestions.push('Implement loading states for better UX');

    return suggestions;
  }
}

// Export singleton instance
export const projectPlanner = new ProjectPlanner();

// Made with Bob