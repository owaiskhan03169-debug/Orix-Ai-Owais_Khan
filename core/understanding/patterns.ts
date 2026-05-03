/**
 * Keyword Patterns and Detection Rules
 * 
 * Predefined patterns for analyzing user prompts and detecting intent.
 */

import { KeywordPattern, ProjectType, TechnologyCategory } from './types';

/**
 * Project type detection patterns
 */
export const PROJECT_TYPE_PATTERNS: Record<ProjectType, KeywordPattern> = {
  'website': {
    keywords: ['website', 'site', 'landing page', 'homepage', 'web page', 'portfolio'],
    category: 'project-type',
    weight: 1.0,
    implies: ['frontend', 'responsive', 'navigation']
  },
  'web-app': {
    keywords: ['web app', 'application', 'dashboard', 'platform', 'system', 'tool'],
    category: 'project-type',
    weight: 1.0,
    implies: ['frontend', 'backend', 'database', 'authentication']
  },
  'mobile-app': {
    keywords: ['mobile app', 'ios app', 'android app', 'mobile application', 'react native'],
    category: 'project-type',
    weight: 1.0,
    implies: ['mobile', 'responsive', 'touch-friendly']
  },
  'desktop-app': {
    keywords: ['desktop app', 'electron app', 'desktop application', 'native app'],
    category: 'project-type',
    weight: 1.0,
    implies: ['electron', 'desktop', 'native']
  },
  'api': {
    keywords: ['api', 'rest api', 'graphql', 'backend', 'server', 'endpoint'],
    category: 'project-type',
    weight: 1.0,
    implies: ['backend', 'database', 'authentication']
  },
  'library': {
    keywords: ['library', 'package', 'npm package', 'component library', 'sdk'],
    category: 'project-type',
    weight: 1.0,
    implies: ['typescript', 'documentation', 'testing']
  },
  'cli-tool': {
    keywords: ['cli', 'command line', 'terminal tool', 'cli tool'],
    category: 'project-type',
    weight: 1.0,
    implies: ['node', 'typescript', 'commander']
  },
  'game': {
    keywords: ['game', 'gaming', 'interactive game', 'browser game'],
    category: 'project-type',
    weight: 1.0,
    implies: ['canvas', 'animation', 'game-logic']
  },
  'unknown': {
    keywords: [],
    category: 'project-type',
    weight: 0.0
  }
};

/**
 * Technology detection patterns
 */
export const TECHNOLOGY_PATTERNS: Record<string, KeywordPattern> = {
  // Frontend Frameworks
  'react': {
    keywords: ['react', 'react.js', 'reactjs'],
    category: 'frontend',
    weight: 1.0,
    implies: ['jsx', 'components', 'hooks']
  },
  'vue': {
    keywords: ['vue', 'vue.js', 'vuejs'],
    category: 'frontend',
    weight: 1.0,
    implies: ['components', 'composition-api']
  },
  'angular': {
    keywords: ['angular', 'angular.js'],
    category: 'frontend',
    weight: 1.0,
    implies: ['typescript', 'components', 'services']
  },
  'svelte': {
    keywords: ['svelte', 'sveltekit'],
    category: 'frontend',
    weight: 1.0,
    implies: ['components', 'reactive']
  },
  
  // Backend Frameworks
  'express': {
    keywords: ['express', 'express.js'],
    category: 'backend',
    weight: 1.0,
    implies: ['node', 'api', 'middleware']
  },
  'fastify': {
    keywords: ['fastify'],
    category: 'backend',
    weight: 1.0,
    implies: ['node', 'api', 'performance']
  },
  'nestjs': {
    keywords: ['nest', 'nestjs', 'nest.js'],
    category: 'backend',
    weight: 1.0,
    implies: ['typescript', 'decorators', 'modules']
  },
  
  // Styling
  'tailwind': {
    keywords: ['tailwind', 'tailwindcss', 'tailwind css'],
    category: 'styling',
    weight: 1.0,
    implies: ['utility-first', 'responsive']
  },
  'css': {
    keywords: ['css', 'stylesheet', 'styling'],
    category: 'styling',
    weight: 0.8
  },
  'sass': {
    keywords: ['sass', 'scss'],
    category: 'styling',
    weight: 0.9,
    implies: ['variables', 'mixins']
  },
  
  // Databases
  'mongodb': {
    keywords: ['mongodb', 'mongo'],
    category: 'database',
    weight: 1.0,
    implies: ['nosql', 'documents']
  },
  'postgresql': {
    keywords: ['postgresql', 'postgres', 'pg'],
    category: 'database',
    weight: 1.0,
    implies: ['sql', 'relational']
  },
  'mysql': {
    keywords: ['mysql'],
    category: 'database',
    weight: 1.0,
    implies: ['sql', 'relational']
  },
  
  // Other
  'typescript': {
    keywords: ['typescript', 'ts'],
    category: 'other',
    weight: 1.0,
    implies: ['types', 'interfaces']
  },
  'electron': {
    keywords: ['electron'],
    category: 'other',
    weight: 1.0,
    implies: ['desktop', 'node', 'chromium']
  }
};

/**
 * Feature detection patterns
 */
export const FEATURE_PATTERNS: Record<string, KeywordPattern> = {
  'authentication': {
    keywords: ['login', 'signup', 'authentication', 'auth', 'user accounts', 'register'],
    category: 'feature',
    weight: 1.0,
    implies: ['backend', 'database', 'security']
  },
  'navigation': {
    keywords: ['navigation', 'menu', 'navbar', 'header', 'routing'],
    category: 'feature',
    weight: 0.9,
    implies: ['routing', 'links']
  },
  'forms': {
    keywords: ['form', 'contact form', 'input', 'submission'],
    category: 'feature',
    weight: 0.9,
    implies: ['validation', 'user-input']
  },
  'search': {
    keywords: ['search', 'search bar', 'filter', 'find'],
    category: 'feature',
    weight: 0.8,
    implies: ['filtering', 'query']
  },
  'dashboard': {
    keywords: ['dashboard', 'admin panel', 'control panel'],
    category: 'feature',
    weight: 1.0,
    implies: ['charts', 'data-visualization', 'analytics']
  },
  'chat': {
    keywords: ['chat', 'messaging', 'real-time chat', 'messages'],
    category: 'feature',
    weight: 1.0,
    implies: ['websockets', 'real-time', 'backend']
  },
  'payment': {
    keywords: ['payment', 'checkout', 'stripe', 'paypal', 'billing'],
    category: 'feature',
    weight: 1.0,
    implies: ['backend', 'security', 'api-integration']
  },
  'file-upload': {
    keywords: ['upload', 'file upload', 'image upload', 'attachment'],
    category: 'feature',
    weight: 0.9,
    implies: ['storage', 'backend']
  },
  'responsive': {
    keywords: ['responsive', 'mobile-friendly', 'mobile responsive', 'adaptive'],
    category: 'feature',
    weight: 0.8,
    implies: ['css', 'media-queries']
  },
  'dark-mode': {
    keywords: ['dark mode', 'theme', 'light/dark', 'theme switcher'],
    category: 'feature',
    weight: 0.7,
    implies: ['css-variables', 'theme-context']
  }
};

/**
 * UI Style detection patterns
 */
export const UI_STYLE_PATTERNS: Record<string, KeywordPattern> = {
  'modern': {
    keywords: ['modern', 'contemporary', 'sleek', 'clean'],
    category: 'ui-style',
    weight: 1.0
  },
  'minimal': {
    keywords: ['minimal', 'minimalist', 'simple', 'clean'],
    category: 'ui-style',
    weight: 1.0
  },
  'professional': {
    keywords: ['professional', 'business', 'corporate', 'formal'],
    category: 'ui-style',
    weight: 1.0
  },
  'creative': {
    keywords: ['creative', 'artistic', 'unique', 'innovative'],
    category: 'ui-style',
    weight: 1.0
  },
  'playful': {
    keywords: ['playful', 'fun', 'colorful', 'vibrant'],
    category: 'ui-style',
    weight: 1.0
  },
  'elegant': {
    keywords: ['elegant', 'sophisticated', 'refined', 'luxury'],
    category: 'ui-style',
    weight: 1.0
  },
  'futuristic': {
    keywords: ['futuristic', 'sci-fi', 'tech', 'cyberpunk', 'neon'],
    category: 'ui-style',
    weight: 1.0
  },
  'classic': {
    keywords: ['classic', 'traditional', 'timeless', 'vintage'],
    category: 'ui-style',
    weight: 1.0
  }
};

/**
 * Complexity indicators
 */
export const COMPLEXITY_INDICATORS = {
  simple: {
    keywords: ['simple', 'basic', 'quick', 'small', 'landing page'],
    maxFeatures: 5,
    maxPages: 3
  },
  medium: {
    keywords: ['medium', 'standard', 'typical', 'website', 'multi-page'],
    maxFeatures: 15,
    maxPages: 10
  },
  complex: {
    keywords: ['complex', 'advanced', 'full-featured', 'comprehensive', 'platform'],
    maxFeatures: 30,
    maxPages: 25
  },
  enterprise: {
    keywords: ['enterprise', 'large-scale', 'production', 'scalable', 'microservices'],
    maxFeatures: 100,
    maxPages: 100
  }
};

/**
 * Domain-specific patterns
 */
export const DOMAIN_PATTERNS: Record<string, KeywordPattern> = {
  'education': {
    keywords: ['school', 'education', 'learning', 'course', 'student', 'teacher', 'university'],
    category: 'domain',
    weight: 1.0,
    implies: ['courses', 'enrollment', 'grades']
  },
  'ecommerce': {
    keywords: ['shop', 'store', 'ecommerce', 'e-commerce', 'product', 'cart', 'checkout'],
    category: 'domain',
    weight: 1.0,
    implies: ['products', 'cart', 'payment', 'inventory']
  },
  'healthcare': {
    keywords: ['health', 'medical', 'hospital', 'clinic', 'patient', 'doctor'],
    category: 'domain',
    weight: 1.0,
    implies: ['appointments', 'records', 'privacy']
  },
  'finance': {
    keywords: ['finance', 'banking', 'investment', 'trading', 'wallet'],
    category: 'domain',
    weight: 1.0,
    implies: ['security', 'transactions', 'analytics']
  },
  'social': {
    keywords: ['social', 'community', 'network', 'profile', 'feed', 'post'],
    category: 'domain',
    weight: 1.0,
    implies: ['users', 'posts', 'comments', 'likes']
  },
  'portfolio': {
    keywords: ['portfolio', 'showcase', 'personal site', 'resume'],
    category: 'domain',
    weight: 1.0,
    implies: ['projects', 'about', 'contact']
  }
};

// Made with Bob