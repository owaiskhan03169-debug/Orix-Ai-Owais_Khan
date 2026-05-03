/**
 * Project Structure Templates
 * 
 * Predefined templates for different project types.
 */

import { ProjectType } from '../understanding';
import { FolderEntry, FileEntry } from './types';

/**
 * Get base folder structure for project type
 */
export function getBaseFolderStructure(projectType: ProjectType): FolderEntry {
  switch (projectType) {
    case 'website':
    case 'web-app':
      return getWebAppStructure();
    
    case 'desktop-app':
      return getDesktopAppStructure();
    
    case 'api':
      return getAPIStructure();
    
    case 'library':
      return getLibraryStructure();
    
    default:
      return getWebAppStructure();
  }
}

/**
 * Web application structure
 */
function getWebAppStructure(): FolderEntry {
  return {
    path: '/',
    name: 'root',
    description: 'Project root',
    files: [
      {
        path: '/package.json',
        name: 'package.json',
        type: 'config',
        description: 'NPM package configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 30
      },
      {
        path: '/tsconfig.json',
        name: 'tsconfig.json',
        type: 'config',
        description: 'TypeScript configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 25
      },
      {
        path: '/vite.config.ts',
        name: 'vite.config.ts',
        type: 'config',
        description: 'Vite build configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 20
      },
      {
        path: '/tailwind.config.js',
        name: 'tailwind.config.js',
        type: 'config',
        description: 'TailwindCSS configuration',
        dependencies: [],
        exports: [],
        priority: 9,
        estimatedLines: 15
      },
      {
        path: '/postcss.config.js',
        name: 'postcss.config.js',
        type: 'config',
        description: 'PostCSS configuration',
        dependencies: [],
        exports: [],
        priority: 9,
        estimatedLines: 10
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'config',
        description: 'HTML entry point',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 20
      },
      {
        path: '/.gitignore',
        name: '.gitignore',
        type: 'config',
        description: 'Git ignore rules',
        dependencies: [],
        exports: [],
        priority: 8,
        estimatedLines: 15
      },
      {
        path: '/README.md',
        name: 'README.md',
        type: 'config',
        description: 'Project documentation',
        dependencies: [],
        exports: [],
        priority: 7,
        estimatedLines: 50
      }
    ],
    subfolders: [
      {
        path: '/src',
        name: 'src',
        description: 'Source code',
        files: [
          {
            path: '/src/main.tsx',
            name: 'main.tsx',
            type: 'config',
            description: 'Application entry point',
            dependencies: ['react', 'react-dom'],
            exports: [],
            priority: 10,
            estimatedLines: 15
          },
          {
            path: '/src/App.tsx',
            name: 'App.tsx',
            type: 'component',
            description: 'Root application component',
            dependencies: ['react'],
            exports: ['App'],
            priority: 10,
            estimatedLines: 50
          },
          {
            path: '/src/index.css',
            name: 'index.css',
            type: 'style',
            description: 'Global styles',
            dependencies: [],
            exports: [],
            priority: 9,
            estimatedLines: 30
          }
        ],
        subfolders: [
          {
            path: '/src/components',
            name: 'components',
            description: 'Reusable components',
            files: [],
            subfolders: []
          },
          {
            path: '/src/pages',
            name: 'pages',
            description: 'Page components',
            files: [],
            subfolders: []
          },
          {
            path: '/src/layouts',
            name: 'layouts',
            description: 'Layout components',
            files: [],
            subfolders: []
          },
          {
            path: '/src/hooks',
            name: 'hooks',
            description: 'Custom React hooks',
            files: [],
            subfolders: []
          },
          {
            path: '/src/stores',
            name: 'stores',
            description: 'State management stores',
            files: [],
            subfolders: []
          },
          {
            path: '/src/utils',
            name: 'utils',
            description: 'Utility functions',
            files: [],
            subfolders: []
          },
          {
            path: '/src/types',
            name: 'types',
            description: 'TypeScript type definitions',
            files: [],
            subfolders: []
          },
          {
            path: '/src/assets',
            name: 'assets',
            description: 'Static assets',
            files: [],
            subfolders: []
          }
        ]
      },
      {
        path: '/public',
        name: 'public',
        description: 'Public static files',
        files: [],
        subfolders: []
      }
    ]
  };
}

/**
 * Desktop application structure
 */
function getDesktopAppStructure(): FolderEntry {
  const base = getWebAppStructure();
  
  // Add Electron-specific folders
  base.subfolders.push({
    path: '/electron',
    name: 'electron',
    description: 'Electron main process',
    files: [
      {
        path: '/electron/main.ts',
        name: 'main.ts',
        type: 'config',
        description: 'Electron main process',
        dependencies: ['electron'],
        exports: [],
        priority: 10,
        estimatedLines: 100
      },
      {
        path: '/electron/preload.ts',
        name: 'preload.ts',
        type: 'config',
        description: 'Electron preload script',
        dependencies: ['electron'],
        exports: [],
        priority: 10,
        estimatedLines: 50
      }
    ],
    subfolders: []
  });
  
  return base;
}

/**
 * API structure
 */
function getAPIStructure(): FolderEntry {
  return {
    path: '/',
    name: 'root',
    description: 'Project root',
    files: [
      {
        path: '/package.json',
        name: 'package.json',
        type: 'config',
        description: 'NPM package configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 30
      },
      {
        path: '/tsconfig.json',
        name: 'tsconfig.json',
        type: 'config',
        description: 'TypeScript configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 25
      },
      {
        path: '/.env.example',
        name: '.env.example',
        type: 'config',
        description: 'Environment variables template',
        dependencies: [],
        exports: [],
        priority: 9,
        estimatedLines: 10
      }
    ],
    subfolders: [
      {
        path: '/src',
        name: 'src',
        description: 'Source code',
        files: [
          {
            path: '/src/index.ts',
            name: 'index.ts',
            type: 'config',
            description: 'Application entry point',
            dependencies: ['express'],
            exports: [],
            priority: 10,
            estimatedLines: 30
          },
          {
            path: '/src/app.ts',
            name: 'app.ts',
            type: 'config',
            description: 'Express app configuration',
            dependencies: ['express'],
            exports: ['app'],
            priority: 10,
            estimatedLines: 50
          }
        ],
        subfolders: [
          {
            path: '/src/routes',
            name: 'routes',
            description: 'API routes',
            files: [],
            subfolders: []
          },
          {
            path: '/src/controllers',
            name: 'controllers',
            description: 'Route controllers',
            files: [],
            subfolders: []
          },
          {
            path: '/src/models',
            name: 'models',
            description: 'Data models',
            files: [],
            subfolders: []
          },
          {
            path: '/src/middleware',
            name: 'middleware',
            description: 'Express middleware',
            files: [],
            subfolders: []
          },
          {
            path: '/src/services',
            name: 'services',
            description: 'Business logic services',
            files: [],
            subfolders: []
          },
          {
            path: '/src/utils',
            name: 'utils',
            description: 'Utility functions',
            files: [],
            subfolders: []
          },
          {
            path: '/src/types',
            name: 'types',
            description: 'TypeScript type definitions',
            files: [],
            subfolders: []
          }
        ]
      }
    ]
  };
}

/**
 * Library structure
 */
function getLibraryStructure(): FolderEntry {
  return {
    path: '/',
    name: 'root',
    description: 'Project root',
    files: [
      {
        path: '/package.json',
        name: 'package.json',
        type: 'config',
        description: 'NPM package configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 40
      },
      {
        path: '/tsconfig.json',
        name: 'tsconfig.json',
        type: 'config',
        description: 'TypeScript configuration',
        dependencies: [],
        exports: [],
        priority: 10,
        estimatedLines: 30
      },
      {
        path: '/README.md',
        name: 'README.md',
        type: 'config',
        description: 'Library documentation',
        dependencies: [],
        exports: [],
        priority: 9,
        estimatedLines: 100
      }
    ],
    subfolders: [
      {
        path: '/src',
        name: 'src',
        description: 'Source code',
        files: [
          {
            path: '/src/index.ts',
            name: 'index.ts',
            type: 'config',
            description: 'Library entry point',
            dependencies: [],
            exports: [],
            priority: 10,
            estimatedLines: 20
          }
        ],
        subfolders: [
          {
            path: '/src/types',
            name: 'types',
            description: 'Type definitions',
            files: [],
            subfolders: []
          },
          {
            path: '/src/utils',
            name: 'utils',
            description: 'Utility functions',
            files: [],
            subfolders: []
          }
        ]
      },
      {
        path: '/tests',
        name: 'tests',
        description: 'Test files',
        files: [],
        subfolders: []
      },
      {
        path: '/docs',
        name: 'docs',
        description: 'Documentation',
        files: [],
        subfolders: []
      }
    ]
  };
}

/**
 * Get common dependencies for project type
 */
export function getCommonDependencies(projectType: ProjectType): string[] {
  const common = ['typescript'];
  
  switch (projectType) {
    case 'website':
    case 'web-app':
      return [...common, 'react', 'react-dom', 'vite', 'tailwindcss'];
    
    case 'desktop-app':
      return [...common, 'react', 'react-dom', 'electron', 'vite', 'tailwindcss'];
    
    case 'api':
      return [...common, 'express', '@types/express', 'dotenv'];
    
    case 'library':
      return [...common, 'vitest'];
    
    default:
      return common;
  }
}

// Made with Bob