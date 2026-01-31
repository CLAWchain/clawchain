import * as fs from 'fs';
import * as path from 'path';
import { AgentTool, ToolResult } from './index';
import { eventBus } from '../../events/EventBus';

// Blocked paths for security
const BLOCKED_PATHS = [
  '/etc', '/usr', '/bin', '/sbin', '/var', '/root', '/home',
  '~', '.env', 'node_modules', '.git/objects', '.git/hooks',
  'credentials', 'secrets', '.ssh', '.aws', '.gitignore'
];

// Directories allowed for agent writes
// Expanded from just claw-generated to include source directories
const ALLOWED_WRITE_DIRS = [
  // Generated code directories
  'backend/src/claw-generated',
  'claw-generated',
  'src/claw-generated',
  // Source directories for real development
  'backend/src/agent',
  'backend/src/blockchain',
  'backend/src/api',
  'backend/src/validators',
  'backend/src/events',
  'backend/src/config',
  'backend/src/database',
  'backend/src/vm',
  'backend/src/byzantine',
  'backend/src/integrations',
  // Frontend source
  'frontend/src',
  'frontend/src/components',
  // Test files
  'tests',
  'backend/tests',
  'frontend/tests',
  // Documentation (but not README in root)
  'docs'
];

// Files that should NEVER be modified
const PROTECTED_FILES = [
  'package.json',          // Dependencies
  'package-lock.json',     // Lock file
  'tsconfig.json',         // TypeScript config
  'vite.config.ts',        // Build config
  '.gitignore',            // Git config
  'Dockerfile',            // Docker config
  'docker-compose.yml',    // Docker compose
  'railway.json',          // Railway deploy
  'vercel.json',           // Vercel deploy
  'Procfile',              // Heroku/Railway
  '.env',                  // Environment variables
  '.env.example'           // Example env
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

export class FileWriteTool implements AgentTool {
  name = 'write_file';
  description = 'Write content to a file. Creates the file if it doesn\'t exist, or overwrites existing content. Use read_file first to understand the context.';
  
  schema = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path to the file from project root'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      },
      append: {
        type: 'boolean',
        description: 'If true, append to file instead of overwriting (default: false)'
      }
    },
    required: ['path', 'content']
  };

  private projectRoot: string;
  private maxFileSize: number = 500000; // 500KB max write

  constructor() {
    this.projectRoot = getProjectRoot();
  }

  private isPathSafe(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    
    // Block dangerous paths
    for (const blocked of BLOCKED_PATHS) {
      if (normalizedPath.toLowerCase().includes(blocked.toLowerCase())) {
        return false;
      }
    }
    
    // Block parent directory traversal outside project
    if (normalizedPath.includes('..')) {
      const fullPath = path.resolve(this.projectRoot, normalizedPath);
      if (!fullPath.startsWith(this.projectRoot)) {
        return false;
      }
    }
    
    return true;
  }

  private isWriteAllowed(filePath: string): { allowed: boolean; reason?: string } {
    const normalizedPath = path.normalize(filePath);
    const fileName = path.basename(normalizedPath);
    
    // Check protected files
    if (PROTECTED_FILES.includes(fileName)) {
      return { allowed: false, reason: `${fileName} is a protected configuration file` };
    }
    
    // Check if in allowed directory
    const isAllowed = ALLOWED_WRITE_DIRS.some(dir => {
      const normalizedDir = path.normalize(dir);
      return normalizedPath.startsWith(normalizedDir) || 
             normalizedPath.startsWith('./' + normalizedDir) ||
             normalizedPath.includes('/' + normalizedDir + '/');
    });
    
    if (!isAllowed) {
      return { 
        allowed: false, 
        reason: `Writes only allowed in: ${ALLOWED_WRITE_DIRS.slice(0, 5).join(', ')}...` 
      };
    }
    
    return { allowed: true };
  }

  private getFullPath(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    return path.join(this.projectRoot, relativePath);
  }

  // Create a backup before overwriting
  private createBackup(fullPath: string): string | null {
    if (fs.existsSync(fullPath)) {
      const backupDir = path.join(this.projectRoot, '.claw-backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const fileName = path.basename(fullPath);
      const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
      
      try {
        fs.copyFileSync(fullPath, backupPath);
        return backupPath;
      } catch {
        return null;
      }
    }
    return null;
  }

  async execute(params: { path: string; content: string; append?: boolean }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.path) {
      return {
        success: false,
        error: 'Path is required',
        duration: Date.now() - startTime
      };
    }

    if (params.content === undefined) {
      return {
        success: false,
        error: 'Content is required',
        duration: Date.now() - startTime
      };
    }

    if (params.content.length > this.maxFileSize) {
      return {
        success: false,
        error: `Content too large (${params.content.length} bytes). Maximum is ${this.maxFileSize} bytes.`,
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

    const writeCheck = this.isWriteAllowed(params.path);
    if (!writeCheck.allowed) {
      return {
        success: false,
        error: writeCheck.reason || 'Write not allowed',
        duration: Date.now() - startTime
      };
    }

    const fullPath = this.getFullPath(params.path);

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create backup for existing files
      const backupPath = this.createBackup(fullPath);

      // Write the file
      if (params.append && fs.existsSync(fullPath)) {
        fs.appendFileSync(fullPath, params.content, 'utf-8');
      } else {
        fs.writeFileSync(fullPath, params.content, 'utf-8');
      }
      
      eventBus.emit('agent_action', {
        type: 'write_file',
        path: params.path,
        size: params.content.length,
        append: !!params.append,
        backup: backupPath
      });

      console.log(`[WRITE_TOOL] Wrote ${params.content.length} bytes to ${params.path}`);

      return {
        success: true,
        output: `Successfully wrote ${params.content.length} bytes to ${params.path}`,
        data: { 
          path: params.path,
          size: params.content.length,
          backup: backupPath
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

export const fileWriteTool = new FileWriteTool();
