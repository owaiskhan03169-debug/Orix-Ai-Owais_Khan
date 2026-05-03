/**
 * Code Analyzer
 * Analyzes code structure, complexity, patterns, and quality
 */

import {
  CodeAnalysis,
  StructureAnalysis,
  ComplexityAnalysis,
  PatternAnalysis,
  DependencyAnalysis,
  QualityMetrics,
  ComponentInfo,
  Relationship,
  CodeLocation,
  QualityIssue
} from './types';

export class CodeAnalyzer {
  /**
   * Perform comprehensive code analysis
   */
  async analyzeCode(code: string, language: string = 'typescript'): Promise<CodeAnalysis> {
    return {
      structure: await this.analyzeStructure(code, language),
      complexity: this.analyzeComplexity(code),
      patterns: this.detectPatterns(code, language),
      dependencies: this.analyzeDependencies(code),
      quality: this.assessQuality(code, language)
    };
  }

  /**
   * Analyze code structure
   */
  private async analyzeStructure(code: string, language: string): Promise<StructureAnalysis> {
    const components = this.extractComponents(code, language);
    const relationships = this.extractRelationships(code, components);

    return {
      type: this.determineStructureType(code, language),
      name: this.extractName(code, language),
      purpose: this.inferPurpose(code, components),
      components,
      relationships
    };
  }

  /**
   * Analyze code complexity
   */
  private analyzeComplexity(code: string): ComplexityAnalysis {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    const cognitiveComplexity = this.calculateCognitiveComplexity(code);
    const linesOfCode = code.split('\n').filter(line => line.trim().length > 0).length;
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      cyclomaticComplexity,
      linesOfCode
    );

    let assessment: 'simple' | 'moderate' | 'complex' | 'very_complex';
    if (cyclomaticComplexity <= 5) assessment = 'simple';
    else if (cyclomaticComplexity <= 10) assessment = 'moderate';
    else if (cyclomaticComplexity <= 20) assessment = 'complex';
    else assessment = 'very_complex';

    const suggestions: string[] = [];
    if (cyclomaticComplexity > 10) {
      suggestions.push('Consider breaking down complex functions into smaller ones');
    }
    if (linesOfCode > 300) {
      suggestions.push('File is large; consider splitting into multiple modules');
    }

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode,
      maintainabilityIndex,
      assessment,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Detect design patterns
   */
  private detectPatterns(code: string, language: string): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];

    // Singleton pattern
    if (this.hasSingletonPattern(code)) {
      patterns.push({
        pattern: 'Singleton',
        category: 'creational',
        description: 'Ensures a class has only one instance',
        location: { startLine: 1, endLine: 10 },
        benefits: ['Controlled access to single instance', 'Reduced namespace pollution'],
        tradeoffs: ['Can make testing difficult', 'Hidden dependencies']
      });
    }

    // Factory pattern
    if (this.hasFactoryPattern(code)) {
      patterns.push({
        pattern: 'Factory',
        category: 'creational',
        description: 'Creates objects without specifying exact class',
        location: { startLine: 1, endLine: 10 },
        benefits: ['Loose coupling', 'Easy to extend'],
        tradeoffs: ['Additional complexity']
      });
    }

    // Observer pattern
    if (this.hasObserverPattern(code)) {
      patterns.push({
        pattern: 'Observer',
        category: 'behavioral',
        description: 'Defines one-to-many dependency between objects',
        location: { startLine: 1, endLine: 10 },
        benefits: ['Loose coupling', 'Dynamic relationships'],
        tradeoffs: ['Can cause memory leaks if not managed']
      });
    }

    // Strategy pattern
    if (this.hasStrategyPattern(code)) {
      patterns.push({
        pattern: 'Strategy',
        category: 'behavioral',
        description: 'Defines family of algorithms, makes them interchangeable',
        location: { startLine: 1, endLine: 10 },
        benefits: ['Easy to switch algorithms', 'Open/Closed principle'],
        tradeoffs: ['Increased number of objects']
      });
    }

    return patterns;
  }

  /**
   * Analyze dependencies
   */
  private analyzeDependencies(code: string): DependencyAnalysis {
    const internal: string[] = [];
    const external: string[] = [];

    // Extract import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const dep = match[1];
      if (dep.startsWith('.') || dep.startsWith('/')) {
        internal.push(dep);
      } else {
        external.push(dep);
      }
    }

    return {
      internal: [...new Set(internal)],
      external: [...new Set(external)],
      graph: [],
      issues: this.detectDependencyIssues(internal, external)
    };
  }

  /**
   * Assess code quality
   */
  private assessQuality(code: string, language: string): QualityMetrics {
    const issues: QualityIssue[] = [];

    // Check for common issues
    if (code.includes('any')) {
      issues.push({
        category: 'Type Safety',
        severity: 'medium',
        message: 'Usage of "any" type reduces type safety',
        fix: 'Use specific types instead of "any"'
      });
    }

    if (code.includes('console.log')) {
      issues.push({
        category: 'Code Quality',
        severity: 'low',
        message: 'Console.log statements found',
        fix: 'Remove or replace with proper logging'
      });
    }

    if (code.includes('TODO') || code.includes('FIXME')) {
      issues.push({
        category: 'Completeness',
        severity: 'medium',
        message: 'TODO/FIXME comments found',
        fix: 'Address pending tasks'
      });
    }

    // Calculate metrics
    const readability = this.calculateReadability(code);
    const maintainability = this.calculateMaintainability(code);
    const testability = this.calculateTestability(code);
    const performance = this.calculatePerformance(code);
    const security = this.calculateSecurity(code);

    return {
      readability,
      maintainability,
      testability,
      performance,
      security,
      overall: Math.round((readability + maintainability + testability + performance + security) / 5),
      issues
    };
  }

  // Helper methods

  private extractComponents(code: string, language: string): ComponentInfo[] {
    const components: ComponentInfo[] = [];

    // Extract functions
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*[=:]?\s*(?:\([^)]*\)|async)/g;
    let match;
    let lineNumber = 1;

    while ((match = functionRegex.exec(code)) !== null) {
      components.push({
        name: match[1],
        type: 'function',
        description: `Function: ${match[1]}`,
        location: { startLine: lineNumber, endLine: lineNumber + 10 }
      });
    }

    // Extract classes
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(code)) !== null) {
      components.push({
        name: match[1],
        type: 'class',
        description: `Class: ${match[1]}`,
        location: { startLine: lineNumber, endLine: lineNumber + 20 }
      });
    }

    return components;
  }

  private extractRelationships(code: string, components: ComponentInfo[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Detect imports
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      const from = match[2];

      imports.forEach(imp => {
        relationships.push({
          from: 'current',
          to: imp,
          type: 'imports',
          description: `Imports ${imp} from ${from}`
        });
      });
    }

    return relationships;
  }

  private determineStructureType(code: string, language: string): any {
    if (code.includes('class ')) return 'class';
    if (code.includes('function ') || code.includes('const ') || code.includes('=>')) return 'function';
    if (code.includes('export default')) return 'module';
    return 'file';
  }

  private extractName(code: string, language: string): string {
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) return classMatch[1];

    const functionMatch = code.match(/(?:function|const)\s+(\w+)/);
    if (functionMatch) return functionMatch[1];

    return 'Unknown';
  }

  private inferPurpose(code: string, components: ComponentInfo[]): string {
    if (code.includes('Service')) return 'Service class for business logic';
    if (code.includes('Component')) return 'UI component';
    if (code.includes('Controller')) return 'Controller for handling requests';
    if (code.includes('Model')) return 'Data model';
    return 'Code module';
  }

  private calculateCyclomaticComplexity(code: string): number {
    let complexity = 1;
    const keywords = ['if', 'else if', 'for', 'while', 'case', '&&', '||', '?'];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  private calculateCognitiveComplexity(code: string): number {
    // Simplified cognitive complexity
    return Math.floor(this.calculateCyclomaticComplexity(code) * 1.2);
  }

  private calculateMaintainabilityIndex(complexity: number, loc: number): number {
    // Simplified maintainability index (0-100)
    const base = 171 - 5.2 * Math.log(loc) - 0.23 * complexity;
    return Math.max(0, Math.min(100, Math.round(base)));
  }

  private hasSingletonPattern(code: string): boolean {
    return code.includes('private static instance') || 
           code.includes('getInstance()');
  }

  private hasFactoryPattern(code: string): boolean {
    return code.includes('create') && code.includes('Factory');
  }

  private hasObserverPattern(code: string): boolean {
    return (code.includes('subscribe') || code.includes('addEventListener')) &&
           (code.includes('notify') || code.includes('emit'));
  }

  private hasStrategyPattern(code: string): boolean {
    return code.includes('strategy') || 
           (code.includes('interface') && code.includes('execute'));
  }

  private detectDependencyIssues(internal: string[], external: string[]): any[] {
    return [];
  }

  private calculateReadability(code: string): number {
    let score = 100;
    
    // Penalize long lines
    const lines = code.split('\n');
    const longLines = lines.filter(l => l.length > 120).length;
    score -= longLines * 2;

    // Penalize lack of comments
    const commentLines = lines.filter(l => l.trim().startsWith('//')).length;
    if (commentLines < lines.length * 0.1) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateMaintainability(code: string): number {
    const complexity = this.calculateCyclomaticComplexity(code);
    const loc = code.split('\n').length;
    return this.calculateMaintainabilityIndex(complexity, loc);
  }

  private calculateTestability(code: string): number {
    let score = 70;
    
    if (code.includes('export')) score += 10;
    if (code.includes('interface') || code.includes('type')) score += 10;
    if (!code.includes('private')) score += 10;

    return Math.min(100, score);
  }

  private calculatePerformance(code: string): number {
    let score = 90;

    if (code.includes('for') && code.includes('for')) score -= 10; // Nested loops
    if (code.includes('while (true)')) score -= 20;
    if (code.includes('eval(')) score -= 30;

    return Math.max(0, score);
  }

  private calculateSecurity(code: string): number {
    let score = 100;

    if (code.includes('eval(')) score -= 30;
    if (code.includes('innerHTML')) score -= 20;
    if (code.includes('dangerouslySetInnerHTML')) score -= 15;
    if (code.includes('password') && !code.includes('hash')) score -= 10;

    return Math.max(0, score);
  }
}

// Made with Bob
