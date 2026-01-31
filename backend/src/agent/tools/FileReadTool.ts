import * as fs from 'fs';
import * as path from 'path';
import { AgentTool, ToolResult } from './index';
import { eventBus } from '../../events/EventBus';

// Blocked paths for security
const BLOCKED_PATHS = [
  '/etc', '/usr', '/bin', '/sbin', '/var', '/root', '/home',
  '~', '.env', 'node_modules', '.git/objects', '.git/hooks',
  'credentials', 'secrets', '.ssh', '.aws'
];

// Get project root
function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }
  if (fs.existsSync('/app/backend')) {
    return '/app';
  }
  return path.resolve(__dirname, '../../../../');
}

export class FileReadTool implements AgentTool {
  name = 'read_file';
  description = 'Read the contents of a file in the codebase. Use this to understand existing code before making changes.';
  
  schema = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path to the file from project root (e.g., "backend/src/index.ts")'
      },
      startLine: {
        type: 'number',
        description: 'Optional: Start reading from this line number (1-based)'
      },
      endLine: {
        type: 'number',
        description: 'Optional: Stop reading at this line number'
      }
    },
    required: ['path']
  };

  private projectRoot: string;
  private maxFileSize: number = 100000; // 100KB max read

  constructor() {
    this.projectRoot = getProjectRoot();
  }

  private isPathSafe(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    
    // Block absolute paths outside project
    if (path.isAbsolute(normalizedPath)) {
      if (!normalizedPath.startsWith(this.projectRoot)) {
        return false;
      }
    }
    
    // Block dangerous paths
    for (const blocked of BLOCKED_PATHS) {
      if (normalizedPath.includes(blocked)) {
        return false;
      }
    }
    
    // Block parent directory traversal
    if (normalizedPath.includes('..')) {
      const fullPath = path.resolve(this.projectRoot, normalizedPath);
      if (!fullPath.startsWith(this.projectRoot)) {
        return false;
      }
    }
    
    return true;
  }

  private getFullPath(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    return path.join(this.projectRoot, relativePath);
  }

  async execute(params: { path: string; startLine?: number; endLine?: number }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.path) {
      return {
        success: false,
        error: 'Path is required',
        duration: Date.now() - startTime
      };
    }

    if (!this.isPathSafe(params.path)) {
      return {
        success: false,
        error: 'Path not allowed for security reasons',
        duration: Date.now() - startTime
      };
    }

    const fullPath = this.getFullPath(params.path);

    try {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // List directory contents instead
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
        const files = entries.map(e => (e.isDirectory() ? `[DIR] ${e.name}` : e.name));
        
        return {
          success: true,
          output: `Directory listing for ${params.path}:\n${files.join('\n')}`,
          data: { type: 'directory', files },
          duration: Date.now() - startTime
        };
      }
      
      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large (${stats.size} bytes). Maximum is ${this.maxFileSize} bytes.`,
          duration: Date.now() - startTime
        };
      }

      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Apply line range if specified
      if (params.startLine || params.endLine) {
        const lines = content.split('\n');
        const start = (params.startLine || 1) - 1;
        const end = params.endLine || lines.length;
        content = lines.slice(start, end).join('\n');
      }
      
      eventBus.emit('agent_action', {
        type: 'read_file',
        path: params.path,
        size: content.length
      });

      return {
        success: true,
        output: content,
        data: { 
          path: params.path,
          size: content.length,
          lines: content.split('\n').length
        },
        duration: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
}

export const fileReadTool = new FileReadTool();
