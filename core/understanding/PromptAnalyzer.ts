/**
 * Prompt Analyzer
 * 
 * Analyzes natural language prompts and extracts structured project requirements.
 */

import {
  PromptUnderstanding,
  ProjectType,
  ComplexityLevel,
  Technology,
  Feature,
  ArchitectureType,
  UIStyle,
  AnalysisContext
} from './types';

import {
  PROJECT_TYPE_PATTERNS,
  TECHNOLOGY_PATTERNS,
  FEATURE_PATTERNS,
  UI_STYLE_PATTERNS,
  COMPLEXITY_INDICATORS,
  DOMAIN_PATTERNS
} from './patterns';

export class PromptAnalyzer {
  /**
   * Analyze a user prompt and extract structured understanding
   */
  async analyze(
    prompt: string,
    context?: AnalysisContext
  ): Promise<PromptUnderstanding> {
    const startTime = Date.now();
    const normalizedPrompt = this.normalizePrompt(prompt);

    // Detect project type
    const projectType = this.detectProjectType(normalizedPrompt);

    // Detect complexity
    const complexity = this.detectComplexity(normalizedPrompt);

    // Detect technologies
    const technologies = this.detectTechnologies(normalizedPrompt, projectType, context);

    // Detect features
    const features = this.detectFeatures(normalizedPrompt);

    // Detect architecture
    const architecture = this.detectArchitecture(projectType, features);

    // Detect UI style
    const uiStyle = this.detectUIStyle(normalizedPrompt);

    // Detect UI preferences
    const responsive = this.detectResponsive(normalizedPrompt);
    const darkMode = this.detectDarkMode(normalizedPrompt);

    // Calculate estimates
    const estimates = this.calculateEstimates(complexity, features, projectType);

    // Detect additional context
    const targetAudience = this.detectTargetAudience(normalizedPrompt);
    const businessDomain = this.detectBusinessDomain(normalizedPrompt);
    const specialRequirements = this.detectSpecialRequirements(normalizedPrompt);

    // Calculate confidence scores
    const confidence = this.calculateConfidence(
      normalizedPrompt,
      projectType,
      technologies,
      features
    );

    const processingTime = Date.now() - startTime;

    return {
      originalPrompt: prompt,
      projectType,
      complexity,
      technologies,
      architecture,
      features,
      uiStyle,
      responsive,
      darkMode,
      estimatedFiles: estimates.files,
      estimatedComponents: estimates.components,
      estimatedPages: estimates.pages,
      estimatedDuration: estimates.duration,
      targetAudience,
      businessDomain,
      specialRequirements,
      confidence,
      analyzedAt: Date.now(),
      processingTime
    };
  }

  /**
   * Normalize prompt for analysis
   */
  private normalizePrompt(prompt: string): string {
    return prompt.toLowerCase().trim();
  }

  /**
   * Detect project type from prompt
   */
  private detectProjectType(prompt: string): ProjectType {
    let bestMatch: ProjectType = 'unknown';
    let highestScore = 0;

    for (const [type, pattern] of Object.entries(PROJECT_TYPE_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = type as ProjectType;
      }
    }

    // Default to website if no clear match
    if (bestMatch === 'unknown' && highestScore === 0) {
      bestMatch = 'website';
    }

    return bestMatch;
  }

  /**
   * Detect complexity level
   */
  private detectComplexity(prompt: string): ComplexityLevel {
    // Check for explicit complexity keywords
    for (const [level, indicators] of Object.entries(COMPLEXITY_INDICATORS)) {
      for (const keyword of indicators.keywords) {
        if (prompt.includes(keyword)) {
          return level as ComplexityLevel;
        }
      }
    }

    // Infer from prompt length and feature count
    const wordCount = prompt.split(/\s+/).length;
    const featureCount = this.countFeatureMentions(prompt);

    if (wordCount < 10 && featureCount < 3) return 'simple';
    if (wordCount < 30 && featureCount < 8) return 'medium';
    if (wordCount < 60 && featureCount < 15) return 'complex';
    return 'enterprise';
  }

  /**
   * Detect required technologies
   */
  private detectTechnologies(
    prompt: string,
    projectType: ProjectType,
    context?: AnalysisContext
  ): Technology[] {
    const technologies: Technology[] = [];
    const detectedTechs = new Set<string>();

    // Check for explicitly mentioned technologies
    for (const [tech, pattern] of Object.entries(TECHNOLOGY_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > 0) {
        detectedTechs.add(tech);
        technologies.push({
          name: tech,
          category: pattern.category as any,
          required: true,
          reason: `Explicitly mentioned in prompt`
        });
      }
    }

    // Add default technologies based on project type
    const defaults = this.getDefaultTechnologies(projectType, context);
    for (const tech of defaults) {
      if (!detectedTechs.has(tech.name.toLowerCase())) {
        technologies.push(tech);
      }
    }

    return technologies;
  }

  /**
   * Get default technologies for project type
   */
  private getDefaultTechnologies(
    projectType: ProjectType,
    context?: AnalysisContext
  ): Technology[] {
    const defaults: Technology[] = [];

    // Always include TypeScript
    defaults.push({
      name: 'TypeScript',
      category: 'other',
      required: true,
      reason: 'Type safety and better developer experience'
    });

    // Frontend projects
    if (['website', 'web-app', 'desktop-app'].includes(projectType)) {
      defaults.push({
        name: 'React',
        category: 'frontend',
        required: true,
        reason: 'Modern component-based UI framework'
      });

      defaults.push({
        name: 'TailwindCSS',
        category: 'styling',
        required: true,
        reason: 'Utility-first CSS framework for rapid UI development'
      });
    }

    // Desktop apps
    if (projectType === 'desktop-app') {
      defaults.push({
        name: 'Electron',
        category: 'other',
        required: true,
        reason: 'Cross-platform desktop application framework'
      });
    }

    // Backend/API projects
    if (['api', 'web-app'].includes(projectType)) {
      defaults.push({
        name: 'Node.js',
        category: 'backend',
        required: true,
        reason: 'JavaScript runtime for backend'
      });

      defaults.push({
        name: 'Express',
        category: 'backend',
        required: true,
        reason: 'Minimal and flexible Node.js web framework'
      });
    }

    return defaults;
  }

  /**
   * Detect features from prompt
   */
  private detectFeatures(prompt: string): Feature[] {
    const features: Feature[] = [];

    for (const [featureName, pattern] of Object.entries(FEATURE_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > 0) {
        features.push({
          name: featureName,
          description: this.getFeatureDescription(featureName),
          priority: this.calculateFeaturePriority(score, pattern.weight),
          estimatedComplexity: this.estimateFeatureComplexity(featureName)
        });
      }
    }

    return features;
  }

  /**
   * Detect architecture type
   */
  private detectArchitecture(
    projectType: ProjectType,
    features: Feature[]
  ): ArchitectureType {
    const hasBackend = features.some(f =>
      ['authentication', 'database', 'api'].includes(f.name)
    );

    if (projectType === 'api') return 'backend-only';
    if (projectType === 'website' && !hasBackend) return 'frontend-only';
    if (hasBackend) return 'fullstack';

    return 'frontend-only';
  }

  /**
   * Detect UI style
   */
  private detectUIStyle(prompt: string): UIStyle {
    let bestMatch: UIStyle = 'modern';
    let highestScore = 0;

    for (const [style, pattern] of Object.entries(UI_STYLE_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = style as UIStyle;
      }
    }

    return bestMatch;
  }

  /**
   * Detect if responsive design is needed
   */
  private detectResponsive(prompt: string): boolean {
    const responsiveKeywords = ['responsive', 'mobile', 'mobile-friendly', 'adaptive'];
    return responsiveKeywords.some(keyword => prompt.includes(keyword)) || true; // Default to true
  }

  /**
   * Detect if dark mode is needed
   */
  private detectDarkMode(prompt: string): boolean {
    const darkModeKeywords = ['dark mode', 'dark theme', 'theme'];
    return darkModeKeywords.some(keyword => prompt.includes(keyword));
  }

  /**
   * Calculate project estimates
   */
  private calculateEstimates(
    complexity: ComplexityLevel,
    features: Feature[],
    projectType: ProjectType
  ): {
    files: number;
    components: number;
    pages: number;
    duration: string;
  } {
    const baseMultiplier = {
      simple: 1,
      medium: 2,
      complex: 4,
      enterprise: 8
    }[complexity];

    const featureCount = features.length;

    return {
      files: Math.max(10, featureCount * 2 * baseMultiplier),
      components: Math.max(5, featureCount * baseMultiplier),
      pages: Math.max(3, Math.ceil(featureCount / 2) * baseMultiplier),
      duration: this.estimateDuration(complexity, featureCount)
    };
  }

  /**
   * Estimate development duration
   */
  private estimateDuration(complexity: ComplexityLevel, featureCount: number): string {
    const hours = {
      simple: 2,
      medium: 8,
      complex: 24,
      enterprise: 80
    }[complexity] + (featureCount * 0.5);

    if (hours < 4) return '1-2 hours';
    if (hours < 12) return '4-8 hours';
    if (hours < 40) return '1-2 days';
    return '3-5 days';
  }

  /**
   * Detect target audience
   */
  private detectTargetAudience(prompt: string): string | undefined {
    const audiences = ['students', 'teachers', 'customers', 'users', 'clients', 'patients'];
    for (const audience of audiences) {
      if (prompt.includes(audience)) {
        return audience;
      }
    }
    return undefined;
  }

  /**
   * Detect business domain
   */
  private detectBusinessDomain(prompt: string): string | undefined {
    for (const [domain, pattern] of Object.entries(DOMAIN_PATTERNS)) {
      const score = this.calculatePatternScore(prompt, pattern.keywords);
      if (score > 0) {
        return domain;
      }
    }
    return undefined;
  }

  /**
   * Detect special requirements
   */
  private detectSpecialRequirements(prompt: string): string[] {
    const requirements: string[] = [];

    if (prompt.includes('seo')) requirements.push('SEO optimization');
    if (prompt.includes('accessibility')) requirements.push('Accessibility (WCAG)');
    if (prompt.includes('performance')) requirements.push('High performance');
    if (prompt.includes('security')) requirements.push('Enhanced security');
    if (prompt.includes('real-time')) requirements.push('Real-time updates');
    if (prompt.includes('offline')) requirements.push('Offline support');

    return requirements;
  }

  /**
   * Calculate confidence scores
   */
  private calculateConfidence(
    prompt: string,
    projectType: ProjectType,
    technologies: Technology[],
    features: Feature[]
  ): {
    projectType: number;
    technologies: number;
    features: number;
    overall: number;
  } {
    const wordCount = prompt.split(/\s+/).length;

    // More words generally mean more confidence
    const lengthFactor = Math.min(wordCount / 20, 1);

    const projectTypeConfidence = projectType !== 'unknown' ? 0.8 + lengthFactor * 0.2 : 0.3;
    const technologiesConfidence = technologies.length > 0 ? 0.7 + lengthFactor * 0.3 : 0.5;
    const featuresConfidence = features.length > 0 ? 0.8 + lengthFactor * 0.2 : 0.4;

    const overall = (projectTypeConfidence + technologiesConfidence + featuresConfidence) / 3;

    return {
      projectType: projectTypeConfidence,
      technologies: technologiesConfidence,
      features: featuresConfidence,
      overall
    };
  }

  /**
   * Calculate pattern matching score
   */
  private calculatePatternScore(text: string, keywords: string[]): number {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    return score;
  }

  /**
   * Count feature mentions in prompt
   */
  private countFeatureMentions(prompt: string): number {
    let count = 0;
    for (const pattern of Object.values(FEATURE_PATTERNS)) {
      if (this.calculatePatternScore(prompt, pattern.keywords) > 0) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get feature description
   */
  private getFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      authentication: 'User login and registration system',
      navigation: 'Site navigation and routing',
      forms: 'Input forms and validation',
      search: 'Search and filtering functionality',
      dashboard: 'Admin dashboard and analytics',
      chat: 'Real-time messaging system',
      payment: 'Payment processing integration',
      'file-upload': 'File upload and management',
      responsive: 'Mobile-responsive design',
      'dark-mode': 'Dark mode theme support'
    };
    return descriptions[featureName] || featureName;
  }

  /**
   * Calculate feature priority
   */
  private calculateFeaturePriority(score: number, weight: number): 'high' | 'medium' | 'low' {
    const priority = score * weight;
    if (priority >= 1.5) return 'high';
    if (priority >= 0.8) return 'medium';
    return 'low';
  }

  /**
   * Estimate feature complexity
   */
  private estimateFeatureComplexity(featureName: string): number {
    const complexities: Record<string, number> = {
      authentication: 8,
      navigation: 3,
      forms: 4,
      search: 5,
      dashboard: 7,
      chat: 9,
      payment: 9,
      'file-upload': 6,
      responsive: 4,
      'dark-mode': 3
    };
    return complexities[featureName] || 5;
  }
}

// Export singleton instance
export const promptAnalyzer = new PromptAnalyzer();

// Made with Bob