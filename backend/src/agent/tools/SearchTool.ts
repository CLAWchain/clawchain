import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AgentTool, ToolResult } from './index';
import { eventBus } from '../../events/EventBus';

function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }
  if (fs.existsSync('/app/backend')) {
    return '/app';
  }
  return path.resolve(__dirname, '../../../../');
}

interface SearchMatch {
  file: string;
  line: number;
  content: string;
}

export class SearchTool implements AgentTool {
  name = 'search_code';
  description = 'Search for patterns in the codebase. Use to find function definitions, usages, imports, etc.';
  
  schema = {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Text or regex pattern to search for'
      },
      filePattern: {
        type: 'string',
        description: 'File glob pattern (e.g., "*.ts", "*.tsx"). Default: TypeScript files'
      },
      directory: {
        type: 'string',
        description: 'Directory to search in (relative to project root). Default: entire project'
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Case-sensitive search (default: false)'
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (default: 50)'
      }
    },
    required: ['pattern']
  };

  private projectRoot: string;

  constructor() {
    this.projectRoot = getProjectRoot();
  }

  async execute(params: { 
    pattern: string; 
    filePattern?: string;
    directory?: string;
    caseSensitive?: boolean;
    maxResults?: number;
  }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.pattern) {
      return {
        success: false,
        error: 'Pattern is required',
        duration: Date.now() - startTime
      };
    }

    const maxResults = params.maxResults || 50;
    const filePattern = params.filePattern || '*.ts';
    const caseSensitive = params.caseSensitive ?? false;
    const searchDir = params.directory 
      ? path.join(this.projectRoot, params.directory)
      : this.projectRoot;

    // Validate search directory
    if (!searchDir.startsWith(this.projectRoot)) {
      return {
        success: false,
        error: 'Cannot search outside project root',
        duration: Date.now() - startTime
      };
    }

    const matches: SearchMatch[] = [];

    try {
      // Build grep command
      const caseFlag = caseSensitive ? '' : '-i';
      const includePatterns = filePattern.split(',')
        .map(p => `--include="${p.trim()}"`)
        .join(' ');
      
      // Escape special characters in pattern for grep
      const escapedPattern = params.pattern.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
      
      const command = `grep -rn ${caseFlag} ${includePatterns} "${escapedPattern}" . 2>/dev/null | head -${maxResults * 2}`;
      
      const output = execSync(command, {
        cwd: searchDir,
        encoding: 'utf-8',
        timeout: 30000
      });

      const lines = output.split('\n').filter(Boolean);
      
      for (const line of lines) {
        // Parse grep output: ./path/to/file:line:content
        const match = line.match(/^\.\/(.+?):(\d+):(.*)$/);
        if (match) {
          const [, file, lineNum, content] = match;
          
          // Skip node_modules and .git
          if (file.includes('node_modules') || file.includes('.git')) {
            continue;
          }
          
          matches.push({
            file,
            line: parseInt(lineNum, 10),
            content: content.trim().substring(0, 200)
          });
          
          if (matches.length >= maxResults) break;
        }
      }

      eventBus.emit('agent_action', {
        type: 'search_code',
        pattern: params.pattern,
        matchCount: matches.length
      });

      const resultText = matches.length > 0
        ? matches.map(m => `${m.file}:${m.line}: ${m.content}`).join('\n')
        : 'No matches found';

      return {
        success: true,
        output: `Found ${matches.length} matches:\n\n${resultText}`,
        data: { matches, total: matches.length },
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      // grep returns exit code 1 when no matches found
      if (error.status === 1) {
        return {
          success: true,
          output: 'No matches found',
          data: { matches: [], total: 0 },
          duration: Date.now() - startTime
        };
      }
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  // Convenience method for finding definitions
  async findDefinition(name: string): Promise<SearchMatch[]> {
    const result = await this.execute({
      pattern: `(class|function|const|let|var|interface|type|enum)\\s+${name}`,
      filePattern: '*.ts,*.tsx',
      maxResults: 10
    });
    
    return result.data?.matches || [];
  }

  // Convenience method for finding usages
  async findUsages(name: string): Promise<SearchMatch[]> {
    const result = await this.execute({
      pattern: name,
      filePattern: '*.ts,*.tsx',
      maxResults: 30
    });
    
    return result.data?.matches || [];
  }
}

export const searchTool = new SearchTool();
