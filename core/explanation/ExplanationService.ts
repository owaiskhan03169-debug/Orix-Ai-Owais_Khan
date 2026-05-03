/**
 * Explanation Service
 * Generates educational explanations for code
 */

import { BaseProvider } from '../ai/BaseProvider';
import { CodeAnalyzer } from './CodeAnalyzer';
import {
  ExplanationRequest,
  CodeExplanation,
  ExplanationSection,
  ExplanationLevel,
  ExplanationFocus,
  CodeSnippet,
  ExplanationTemplate
} from './types';

export class ExplanationService {
  private analyzer: CodeAnalyzer;
  private aiProvider: BaseProvider | null = null;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Set AI provider for generating explanations
   */
  setAIProvider(provider: BaseProvider): void {
    this.aiProvider = provider;
  }

  /**
   * Generate comprehensive code explanation
   */
  async explainCode(request: ExplanationRequest): Promise<CodeExplanation> {
    const code = request.code || '';
    const language = request.language || 'typescript';

    // Analyze code
    const analysis = await this.analyzer.analyzeCode(code, language);

    // Generate explanation sections based on level and focus
    const sections = await this.generateSections(request, analysis, code);

    // Generate summary
    const summary = this.generateSummary(analysis, request.level);

    // Extract key points
    const keyPoints = this.extractKeyPoints(analysis, request.level);

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis);

    // Related concepts
    const relatedConcepts = this.identifyRelatedConcepts(analysis);

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      request,
      sections,
      summary,
      keyPoints,
      recommendations,
      relatedConcepts
    };
  }

  /**
   * Generate explanation sections
   */
  private async generateSections(
    request: ExplanationRequest,
    analysis: any,
    code: string
  ): Promise<ExplanationSection[]> {
    const sections: ExplanationSection[] = [];
    const focuses = request.focus || [
      ExplanationFocus.ARCHITECTURE,
      ExplanationFocus.LOGIC,
      ExplanationFocus.BEST_PRACTICES
    ];

    for (const focus of focuses) {
      const section = await this.generateSection(focus, request.level, analysis, code);
      if (section) sections.push(section);
    }

    return sections;
  }

  /**
   * Generate individual section
   */
  private async generateSection(
    focus: ExplanationFocus,
    level: ExplanationLevel,
    analysis: any,
    code: string
  ): Promise<ExplanationSection | null> {
    switch (focus) {
      case ExplanationFocus.ARCHITECTURE:
        return this.explainArchitecture(analysis, level, code);
      
      case ExplanationFocus.LOGIC:
        return this.explainLogic(analysis, level, code);
      
      case ExplanationFocus.ALGORITHMS:
        return this.explainAlgorithms(analysis, level, code);
      
      case ExplanationFocus.DATA_FLOW:
        return this.explainDataFlow(analysis, level, code);
      
      case ExplanationFocus.STATE_MANAGEMENT:
        return this.explainStateManagement(analysis, level, code);
      
      case ExplanationFocus.PERFORMANCE:
        return this.explainPerformance(analysis, level, code);
      
      case ExplanationFocus.BEST_PRACTICES:
        return this.explainBestPractices(analysis, level, code);
      
      case ExplanationFocus.PATTERNS:
        return this.explainPatterns(analysis, level, code);
      
      default:
        return null;
    }
  }

  /**
   * Explain architecture
   */
  private explainArchitecture(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    const { structure } = analysis;
    
    let content = '';
    
    if (level === ExplanationLevel.BEGINNER) {
      content = `This code is organized as a ${structure.type}. `;
      content += `It contains ${structure.components.length} main components that work together. `;
      content += `The purpose is: ${structure.purpose}`;
    } else if (level === ExplanationLevel.INTERMEDIATE) {
      content = `Architecture Overview:\n\n`;
      content += `Type: ${structure.type}\n`;
      content += `Purpose: ${structure.purpose}\n\n`;
      content += `Components:\n`;
      structure.components.forEach((comp: any) => {
        content += `- ${comp.name} (${comp.type}): ${comp.description}\n`;
      });
    } else {
      content = `Advanced Architecture Analysis:\n\n`;
      content += `Structure Type: ${structure.type}\n`;
      content += `Design Purpose: ${structure.purpose}\n\n`;
      content += `Component Breakdown:\n`;
      structure.components.forEach((comp: any) => {
        content += `- ${comp.name}\n`;
        content += `  Type: ${comp.type}\n`;
        content += `  Location: Lines ${comp.location.startLine}-${comp.location.endLine}\n`;
        content += `  Description: ${comp.description}\n\n`;
      });
      
      if (structure.relationships.length > 0) {
        content += `\nRelationships:\n`;
        structure.relationships.forEach((rel: any) => {
          content += `- ${rel.from} ${rel.type} ${rel.to}\n`;
        });
      }
    }

    return {
      title: 'Architecture',
      content,
      importance: 'critical'
    };
  }

  /**
   * Explain logic
   */
  private explainLogic(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    const { complexity } = analysis;
    
    let content = '';
    
    if (level === ExplanationLevel.BEGINNER) {
      content = `This code has ${complexity.assessment} logic. `;
      content += `It performs its task in ${complexity.linesOfCode} lines of code.`;
    } else {
      content = `Logic Analysis:\n\n`;
      content += `Complexity: ${complexity.assessment}\n`;
      content += `Cyclomatic Complexity: ${complexity.cyclomaticComplexity}\n`;
      content += `Lines of Code: ${complexity.linesOfCode}\n`;
      content += `Maintainability Index: ${complexity.maintainabilityIndex}/100\n`;
      
      if (complexity.suggestions) {
        content += `\nSuggestions:\n`;
        complexity.suggestions.forEach((s: string) => {
          content += `- ${s}\n`;
        });
      }
    }

    return {
      title: 'Logic & Flow',
      content,
      importance: 'high'
    };
  }

  /**
   * Explain algorithms
   */
  private explainAlgorithms(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    let content = 'Algorithm Analysis:\n\n';
    
    // Detect common algorithms
    if (code.includes('sort')) {
      content += 'Sorting algorithm detected\n';
    }
    if (code.includes('filter')) {
      content += 'Filtering algorithm detected\n';
    }
    if (code.includes('map')) {
      content += 'Mapping/transformation algorithm detected\n';
    }
    if (code.includes('reduce')) {
      content += 'Reduction algorithm detected\n';
    }

    return {
      title: 'Algorithms',
      content,
      importance: 'medium'
    };
  }

  /**
   * Explain data flow
   */
  private explainDataFlow(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    let content = 'Data Flow:\n\n';
    content += 'This code processes data through the following steps:\n';
    content += '1. Input/initialization\n';
    content += '2. Processing/transformation\n';
    content += '3. Output/return\n';

    return {
      title: 'Data Flow',
      content,
      importance: 'high'
    };
  }

  /**
   * Explain state management
   */
  private explainStateManagement(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    let content = 'State Management:\n\n';
    
    if (code.includes('useState') || code.includes('state')) {
      content += 'This code manages state using React hooks or similar patterns.\n';
    } else {
      content += 'No explicit state management detected.\n';
    }

    return {
      title: 'State Management',
      content,
      importance: 'medium'
    };
  }

  /**
   * Explain performance
   */
  private explainPerformance(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    const { quality } = analysis;
    
    let content = `Performance Analysis:\n\n`;
    content += `Performance Score: ${quality.performance}/100\n\n`;
    
    if (quality.performance < 70) {
      content += 'Performance concerns detected:\n';
      content += '- Consider optimizing loops and iterations\n';
      content += '- Review algorithm complexity\n';
    } else {
      content += 'Performance looks good!\n';
    }

    return {
      title: 'Performance',
      content,
      importance: 'medium'
    };
  }

  /**
   * Explain best practices
   */
  private explainBestPractices(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    const { quality } = analysis;
    
    let content = `Best Practices Assessment:\n\n`;
    content += `Overall Quality: ${quality.overall}/100\n\n`;
    
    if (quality.issues.length > 0) {
      content += 'Issues found:\n';
      quality.issues.forEach((issue: any) => {
        content += `- [${issue.severity}] ${issue.message}\n`;
        if (issue.fix) {
          content += `  Fix: ${issue.fix}\n`;
        }
      });
    } else {
      content += 'No major issues found. Code follows best practices!\n';
    }

    return {
      title: 'Best Practices',
      content,
      importance: 'high'
    };
  }

  /**
   * Explain patterns
   */
  private explainPatterns(analysis: any, level: ExplanationLevel, code: string): ExplanationSection {
    const { patterns } = analysis;
    
    let content = 'Design Patterns:\n\n';
    
    if (patterns.length > 0) {
      patterns.forEach((pattern: any) => {
        content += `${pattern.pattern} Pattern (${pattern.category}):\n`;
        content += `${pattern.description}\n\n`;
        content += `Benefits:\n`;
        pattern.benefits.forEach((b: string) => {
          content += `- ${b}\n`;
        });
        content += '\n';
      });
    } else {
      content += 'No specific design patterns detected.\n';
    }

    return {
      title: 'Design Patterns',
      content,
      importance: 'medium'
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(analysis: any, level: ExplanationLevel): string {
    const { structure, complexity, quality } = analysis;
    
    let summary = `This is a ${structure.type} with ${complexity.assessment} complexity. `;
    summary += `It has a quality score of ${quality.overall}/100. `;
    summary += `The code is ${complexity.maintainabilityIndex > 70 ? 'maintainable' : 'challenging to maintain'}.`;
    
    return summary;
  }

  /**
   * Extract key points
   */
  private extractKeyPoints(analysis: any, level: ExplanationLevel): string[] {
    const points: string[] = [];
    const { structure, complexity, patterns, quality } = analysis;

    points.push(`Structure: ${structure.type}`);
    points.push(`Complexity: ${complexity.assessment}`);
    points.push(`Quality Score: ${quality.overall}/100`);
    
    if (patterns.length > 0) {
      points.push(`Uses ${patterns.length} design pattern(s)`);
    }
    
    if (complexity.suggestions && complexity.suggestions.length > 0) {
      points.push(`Has ${complexity.suggestions.length} improvement suggestion(s)`);
    }

    return points;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];
    const { complexity, quality } = analysis;

    if (complexity.suggestions) {
      recommendations.push(...complexity.suggestions);
    }

    if (quality.overall < 70) {
      recommendations.push('Consider refactoring to improve overall quality');
    }

    if (quality.readability < 70) {
      recommendations.push('Add more comments and improve code formatting');
    }

    if (quality.testability < 70) {
      recommendations.push('Make code more testable by reducing dependencies');
    }

    return recommendations;
  }

  /**
   * Identify related concepts
   */
  private identifyRelatedConcepts(analysis: any): string[] {
    const concepts: string[] = [];
    const { patterns } = analysis;

    patterns.forEach((pattern: any) => {
      concepts.push(pattern.pattern);
    });

    concepts.push('Software Architecture');
    concepts.push('Code Quality');
    concepts.push('Design Patterns');

    return [...new Set(concepts)];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Made with Bob
