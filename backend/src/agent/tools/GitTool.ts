import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AgentTool, ToolResult } from './index';
import { eventBus } from '../../events/EventBus';

// Git configuration
const GIT_USER_NAME = process.env.GIT_USER_NAME || 'CLAWchain';
const GIT_USER_EMAIL = process.env.GIT_USER_EMAIL || 'clawchain@users.noreply.github.com';
const AUTO_PUSH_ENABLED = process.env.AUTO_GIT_PUSH === 'true'; // Disabled by default

function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }
  if (fs.existsSync('/app/backend')) {
    return '/app';
  }
  return path.resolve(__dirname, '../../../../');
}

export class GitTool implements AgentTool {
  name = 'git';
  description = 'Perform git operations: status, diff, add, commit, branch. Push is available only if AUTO_GIT_PUSH=true. Destructive operations like reset --hard are blocked.';
  
  schema = {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['status', 'diff', 'add', 'commit', 'branch', 'checkout', 'log', 'push', 'stash', 'stash_pop'],
        description: 'Git operation to perform'
      },
      message: {
        type: 'string',
        description: 'Commit message (required for commit operation)'
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Files to add (for add operation). If empty, adds all changes.'
      },
      branch: {
        type: 'string',
        description: 'Branch name (for branch/checkout operations)'
      },
      count: {
        type: 'number',
        description: 'Number of commits to show (for log operation, default: 5)'
      }
    },
    required: ['operation']
  };

  private projectRoot: string;
  private maxOutputLength: number = 10000;

  constructor() {
    this.projectRoot = getProjectRoot();
    this.configureGit();
  }

  private configureGit(): void {
    try {
      this.execGit(`config user.name "${GIT_USER_NAME}"`, true);
      this.execGit(`config user.email "${GIT_USER_EMAIL}"`, true);
    } catch {
      // Git might not be initialized
    }
  }

  private execGit(command: string, silent: boolean = false): string {
    try {
      const result = execSync(`git ${command}`, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 30000,
        stdio: silent ? 'pipe' : undefined
      });
      return result.trim();
    } catch (error: any) {
      if (error.stderr) {
        throw new Error(error.stderr.toString().trim());
      }
      throw error;
    }
  }

  async execute(params: { 
    operation: string; 
    message?: string; 
    files?: string[];
    branch?: string;
    count?: number;
  }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.operation) {
      return {
        success: false,
        error: 'Operation is required',
        duration: Date.now() - startTime
      };
    }

    try {
      let output = '';
      let data: any = {};

      switch (params.operation) {
        case 'status': {
          const status = this.execGit('status --porcelain', true);
          const branch = this.execGit('branch --show-current', true);
          
          const lines = status.split('\n').filter(Boolean);
          const staged: string[] = [];
          const modified: string[] = [];
          const untracked: string[] = [];
          
          for (const line of lines) {
            const file = line.substring(3);
            const indexStatus = line[0];
            const workStatus = line[1];
            
            if (indexStatus !== ' ' && indexStatus !== '?') staged.push(file);
            if (workStatus !== ' ') modified.push(file);
            if (indexStatus === '?' && workStatus === '?') untracked.push(file);
          }
          
          output = `Branch: ${branch}\n` +
                   `Staged: ${staged.length}\n` +
                   `Modified: ${modified.length}\n` +
                   `Untracked: ${untracked.length}\n` +
                   `Clean: ${lines.length === 0}`;
          
          data = { branch, staged, modified, untracked, clean: lines.length === 0 };
          break;
        }

        case 'diff': {
          const staged = this.execGit('diff --cached --stat', true);
          const unstaged = this.execGit('diff --stat', true);
          output = `Staged changes:\n${staged || '(none)'}\n\nUnstaged changes:\n${unstaged || '(none)'}`;
          data = { staged, unstaged };
          break;
        }

        case 'add': {
          if (params.files && params.files.length > 0) {
            for (const file of params.files) {
              this.execGit(`add "${file}"`, true);
            }
            output = `Added ${params.files.length} file(s)`;
          } else {
            this.execGit('add -A', true);
            output = 'Added all changes';
          }
          data = { files: params.files || 'all' };
          break;
        }

        case 'commit': {
          if (!params.message) {
            return {
              success: false,
              error: 'Commit message is required',
              duration: Date.now() - startTime
            };
          }
          
          // Stage all changes first
          this.execGit('add -A', true);
          
          // Check if there's anything to commit
          const status = this.execGit('status --porcelain', true);
          if (!status.trim()) {
            return {
              success: true,
              output: 'Nothing to commit, working tree clean',
              duration: Date.now() - startTime
            };
          }
          
          // Create commit with CLAW prefix
          const fullMessage = `[CLAW] ${params.message}`;
          this.execGit(`commit -m "${fullMessage.replace(/"/g, '\\"')}"`, true);
          
          const commitHash = this.execGit('rev-parse --short HEAD', true);
          output = `Created commit: ${commitHash}\nMessage: ${fullMessage}`;
          
          data = { commit: commitHash, message: fullMessage };
          
          eventBus.emit('git_commit', { commit: commitHash, message: fullMessage });
          break;
        }

        case 'branch': {
          if (!params.branch) {
            // List branches
            const branches = this.execGit('branch -v', true);
            output = branches;
            data = { branches: branches.split('\n').filter(Boolean) };
          } else {
            // Create new branch
            const branchName = params.branch.startsWith('claw/') 
              ? params.branch 
              : `claw/${params.branch}`;
            this.execGit(`checkout -b ${branchName}`, true);
            output = `Created and switched to branch: ${branchName}`;
            data = { branch: branchName };
          }
          break;
        }

        case 'checkout': {
          if (!params.branch) {
            return {
              success: false,
              error: 'Branch name is required for checkout',
              duration: Date.now() - startTime
            };
          }
          this.execGit(`checkout ${params.branch}`, true);
          output = `Switched to branch: ${params.branch}`;
          data = { branch: params.branch };
          break;
        }

        case 'log': {
          const count = params.count || 5;
          const log = this.execGit(`log -${count} --oneline`, true);
          output = log;
          data = { 
            commits: log.split('\n').filter(Boolean).map(line => {
              const [hash, ...msgParts] = line.split(' ');
              return { hash, message: msgParts.join(' ') };
            })
          };
          break;
        }

        case 'push': {
          if (!AUTO_PUSH_ENABLED) {
            return {
              success: false,
              error: 'Push is disabled. Set AUTO_GIT_PUSH=true to enable.',
              duration: Date.now() - startTime
            };
          }
          
          const branch = this.execGit('branch --show-current', true);
          this.execGit(`push -u origin ${branch}`, true);
          output = `Pushed to origin/${branch}`;
          data = { branch };
          
          eventBus.emit('git_push', { branch });
          break;
        }

        case 'stash': {
          this.execGit('stash', true);
          output = 'Changes stashed';
          break;
        }

        case 'stash_pop': {
          this.execGit('stash pop', true);
          output = 'Stash applied';
          break;
        }

        default:
          return {
            success: false,
            error: `Unknown operation: ${params.operation}`,
            duration: Date.now() - startTime
          };
      }

      eventBus.emit('agent_action', {
        type: 'git',
        operation: params.operation,
        ...data
      });

      return {
        success: true,
        output: output.substring(0, this.maxOutputLength),
        data,
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

export const gitTool = new GitTool();
