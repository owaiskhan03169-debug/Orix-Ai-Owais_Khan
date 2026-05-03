/**
 * Project Planning Types
 * 
 * Type definitions for the project planning system.
 */

import { PromptUnderstanding } from '../understanding';

/**
 * File type classification
 */
export type FileType = 
  | 'component'
  | 'page'
  | 'layout'
  | 'hook'
  | 'util'
  | 'service'
  | 'store'
  | 'type'
  | 'config'
  | 'style'
  | 'test'
  | 'api'
  | 'middleware'
  | 'model'
  | 'route'
  | 'asset';

/**
 * File entry in project structure
 */
export interface FileEntry {
  path: string;
  name: string;
  type: FileType;
  description: string;
  dependencies: string[];
  exports: string[];
  priority: number; // 1-10, higher = generate first
  estimatedLines: number;
  template?: string;
}

/**
 * Folder entry in project structure
 */
export interface FolderEntry {
  path: string;
  name: string;
  description: string;
  files: FileEntry[];
  subfolders: FolderEntry[];
}

/**
 * Component definition
 */
export interface ComponentDefinition {
  name: string;
  path: string;
  type: 'functional' | 'class' | 'layout' | 'page';
  props: PropDefinition[];
  state: StateDefinition[];
  hooks: string[];
  children: string[];
  parent?: string;
  description: string;
  complexity: number; // 1-10
}

/**
 * Prop definition
 */
export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

/**
 * State definition
 */
export interface StateDefinition {
  name: string;
  type: string;
  initial: string;
  description: string;
}

/**
 * Route definition
 */
export interface RouteDefinition {
  path: string;
  component: string;
  exact: boolean;
  protected: boolean;
  layout?: string;
  title: string;
  description: string;
}

/**
 * API endpoint definition
 */
export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  middleware: string[];
  request?: {
    body?: Record<string, string>;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  response: {
    success: Record<string, string>;
    error: Record<string, string>;
  };
  description: string;
}

/**
 * Database model definition
 */
export interface ModelDefinition {
  name: string;
  collection: string;
  fields: FieldDefinition[];
  indexes: string[];
  relations: RelationDefinition[];
  description: string;
}

/**
 * Field definition
 */
export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: string;
  validation?: string;
  description: string;
}

/**
 * Relation definition
 */
export interface RelationDefinition {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  model: string;
  field: string;
  description: string;
}

/**
 * Dependency definition
 */
export interface DependencyDefinition {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
  reason: string;
  required: boolean;
}

/**
 * Build configuration
 */
export interface BuildConfiguration {
  entry: string;
  output: string;
  publicPath: string;
  devServer?: {
    port: number;
    host: string;
    hot: boolean;
  };
  optimization?: {
    minify: boolean;
    splitChunks: boolean;
  };
}

/**
 * Complete project plan
 */
export interface ProjectPlan {
  // Metadata
  id: string;
  name: string;
  description: string;
  createdAt: number;
  
  // Source understanding
  understanding: PromptUnderstanding;
  
  // Project structure
  rootFolder: FolderEntry;
  fileTree: string[]; // Flat list of all file paths
  
  // Architecture
  components: ComponentDefinition[];
  routes: RouteDefinition[];
  apis: APIEndpoint[];
  models: ModelDefinition[];
  
  // Dependencies
  dependencies: DependencyDefinition[];
  
  // Configuration
  buildConfig: BuildConfiguration;
  
  // Execution plan
  generationOrder: string[]; // File paths in generation order
  estimatedGenerationTime: number; // milliseconds
  
  // Metadata
  totalFiles: number;
  totalComponents: number;
  totalRoutes: number;
  totalLines: number;
}

/**
 * Planning context
 */
export interface PlanningContext {
  understanding: PromptUnderstanding;
  preferences?: {
    folderStructure?: 'flat' | 'feature' | 'layered';
    namingConvention?: 'camelCase' | 'PascalCase' | 'kebab-case';
    testingFramework?: 'jest' | 'vitest' | 'none';
    stateManagement?: 'zustand' | 'redux' | 'context' | 'none';
  };
}

/**
 * Planning result
 */
export interface PlanningResult {
  plan: ProjectPlan;
  warnings: string[];
  suggestions: string[];
  estimatedDuration: string;
}

// Made with Bob