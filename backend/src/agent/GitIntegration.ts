import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { eventBus } from '../events/EventBus';

// Auto-deploy configuration
const AUTO_PUSH_ENABLED = process.env.AUTO_GIT_PUSH !== 'false';
const GIT_USER_NAME = process.env.GIT_USER_NAME || 'CLAWchain';
const GIT_USER_EMAIL = process.env.GIT_USER_EMAIL || 'clawchain@users.noreply.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'CLAWchain/clawchain';

// Git operation result
export interface GitOperationResult {
  success: boolean;
  output: string;
  error?: string;
  branch?: string;
  commit?: string;
  prUrl?: string;
}

// Branch info
export interface BranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
  lastCommitDate: string;
}

// PR info
export interface PullRequestInfo {
  number: number;
  title: string;
  branch: string;
  status: 'open' | 'merged' | 'closed';
  url: string;
}

// Commit info
export interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

export class GitIntegration {
  private projectRoot: string;
  private mainBranch: string = 'main';
  private branchPrefix: string = 'claw/';
  private initialized: boolean = false;

  constructor(projectRoot?: string) {
    // Default to /app in production (Docker/Railway), or project root in development
    if (projectRoot) {
      this.projectRoot = projectRoot;
    } else if (process.env.PROJECT_ROOT) {
      this.projectRoot = process.env.PROJECT_ROOT;
    } else if (fs.existsSync('/app/backend')) {
      // Production container
      this.projectRoot = '/app';
    } else {
      // Development - go up from backend/src/agent or backend/dist/agent
      this.projectRoot = path.resolve(__dirname, '../../../');
      if (!fs.existsSync(path.join(this.projectRoot, 'backend'))) {
        this.projectRoot = path.resolve(__dirname, '../../../../');
      }
    }
    console.log(`[GIT] Initialized with project root: ${this.projectRoot}`);
    this.setupGitConfig();
  }

  // Configure git user and remote for commits
  private setupGitConfig(): void {
    try {
      const gitDir = path.join(this.projectRoot, '.git');
      
      // If no .git and we have credentials, clone the repo
      if (!fs.existsSync(gitDir) && GITHUB_TOKEN && GITHUB_REPO) {
        console.log('[GIT] No .git directory found, cloning repo...');
        const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git`;
        
        try {
          // Clone into a temp location then move .git
          const tempDir = '/tmp/clawchain-clone';
          execSync(`rm -rf ${tempDir}`, { encoding: 'utf-8', stdio: 'pipe' });
          execSync(`git clone --depth 1 ${remoteUrl} ${tempDir}`, { encoding: 'utf-8', stdio: 'pipe', timeout: 60000 });
          
          // Copy .git directory to project root
          execSync(`cp -r ${tempDir}/.git ${this.projectRoot}/`, { encoding: 'utf-8', stdio: 'pipe' });
          execSync(`rm -rf ${tempDir}`, { encoding: 'utf-8', stdio: 'pipe' });
          
          console.log('[GIT] Successfully cloned repo');
        } catch (cloneErr: any) {
          console.error('[GIT] Clone failed, initializing fresh:', cloneErr.message);
          execSync('git init', { cwd: this.projectRoot, encoding: 'utf-8', stdio: 'pipe' });
        }
      } else if (!fs.existsSync(gitDir)) {
        console.log('[GIT] No .git directory found, initializing...');
        execSync('git init', { cwd: this.projectRoot, encoding: 'utf-8', stdio: 'pipe' });
      }

      // Configure user
      execSync(`git config user.name "${GIT_USER_NAME}"`, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      execSync(`git config user.email "${GIT_USER_EMAIL}"`, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Configure remote with token if available
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git`;
        try {
          // Remove existing origin if it exists
          execSync('git remote remove origin', { cwd: this.projectRoot, encoding: 'utf-8', stdio: 'pipe' });
        } catch {
          // Origin might not exist, that's fine
        }
        try {
          execSync(`git remote add origin ${remoteUrl}`, {
            cwd: this.projectRoot,
            encoding: 'utf-8',
            stdio: 'pipe'
          });
        } catch {
          // Origin might already exist from clone
        }
        console.log(`[GIT] Configured remote with token for ${GITHUB_REPO}`);
        
        // Make sure we're on main branch
        try {
          execSync('git checkout main', { cwd: this.projectRoot, encoding: 'utf-8', stdio: 'pipe' });
        } catch {
          // May already be on main or branch doesn't exist
          try {
            execSync('git checkout -b main', { cwd: this.projectRoot, encoding: 'utf-8', stdio: 'pipe' });
          } catch {
            // Branch may already exist
          }
        }
      } else {
        console.log('[GIT] No GITHUB_TOKEN configured - push will not work');
      }

      this.initialized = true;
      console.log(`[GIT] Configured git user: ${GIT_USER_NAME} <${GIT_USER_EMAIL}>`);
    } catch (error) {
      console.error('[GIT] Failed to configure git:', error);
    }
  }

  // Auto-commit and push changes - RE-ENABLED with safety checks
  // Only commits files in allowed directories, never touches deployment configs
  async autoCommitAndPush(message: string, taskId?: string): Promise<GitOperationResult> {
    console.log('[GIT] autoCommitAndPush called:', message);
    
    // Safety check: only auto-commit if AUTO_GIT_PUSH is enabled
    if (AUTO_PUSH_ENABLED === false && !GITHUB_TOKEN) {
      console.log('[GIT] Auto-push disabled (no GITHUB_TOKEN)');
      // Still create local commit
    }
    
    const status = this.getStatus();
    console.log('[GIT] Status:', JSON.stringify(status));
    
    // Nothing to commit
    if (status.clean) {
      console.log('[GIT] Working tree clean, nothing to commit');
      return {
        success: true,
        output: 'No changes to commit'
      };
    }

    // SAFETY: Filter out protected files from staging
    const PROTECTED_FILES = [
      'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts',
      '.gitignore', 'Dockerfile', 'docker-compose.yml', 'railway.json',
      'vercel.json', 'Procfile', '.env', '.env.example', 'README.md'
    ];
    
    const safeChanges = status.changes.filter(file => {
      const fileName = file.split('/').pop() || '';
      // Block protected files
      if (PROTECTED_FILES.includes(fileName)) {
        console.log(`[GIT] Skipping protected file: ${file}`);
        return false;
      }
      // Only allow certain directories
      const allowedDirs = ['backend/src/', 'frontend/src/', 'docs/', 'tests/'];
      const inAllowed = allowedDirs.some(dir => file.startsWith(dir));
      if (!inAllowed) {
        console.log(`[GIT] Skipping file outside allowed dirs: ${file}`);
        return false;
      }
      return true;
    });
    
    if (safeChanges.length === 0) {
      console.log('[GIT] No safe changes to commit');
      return {
        success: true,
        output: 'No changes in allowed directories to commit'
      };
    }

    console.log(`[GIT] Auto-committing ${safeChanges.length} changes...`);

    try {
      // Stage only safe changes (not protected files or files outside allowed dirs)
      for (const file of safeChanges) {
        try {
          this.execGit(`add "${file}"`, true);
        } catch (e) {
          console.log(`[GIT] Failed to stage ${file}`);
        }
      }

      // Create commit with CLAW prefix
      const fullMessage = taskId 
        ? `[CLAW-${taskId}] ${message}`
        : `[CLAW] ${message}`;
      
      this.execGit(`commit -m "${fullMessage.replace(/"/g, '\\"')}"`, true);
      const commitHash = this.execGit('rev-parse --short HEAD', true);

      console.log(`[GIT] Created commit: ${commitHash}`);

      // Push to remote if enabled
      if (AUTO_PUSH_ENABLED) {
        const branch = this.getCurrentBranch() || 'main';
        console.log(`[GIT] Pushing to origin/${branch}...`);
        
        try {
          // First try normal push
          try {
            this.execGit(`push -u origin ${branch}`, true);
          } catch (e: any) {
            // If push fails due to non-fast-forward, try to pull and merge first
            console.log('[GIT] Normal push failed, trying pull then push...');
            try {
              this.execGit('pull origin main --rebase --allow-unrelated-histories', true);
              this.execGit(`push -u origin ${branch}`, true);
            } catch (pullError) {
              // If pull fails too, force push as last resort (new files only)
              console.log('[GIT] Pull failed, force pushing...');
              this.execGit(`push -u origin ${branch} --force`, true);
            }
          }
          console.log(`[GIT] Successfully pushed to origin/${branch}`);
          
          eventBus.emit('git_action', {
            type: 'auto_deploy',
            message: fullMessage,
            commit: commitHash,
            branch,
            pushed: true
          });

          return {
            success: true,
            output: `Committed and pushed: ${commitHash}`,
            commit: commitHash,
            branch
          };
        } catch (pushError: any) {
          console.error('[GIT] Push failed:', pushError.message);
          
          eventBus.emit('git_action', {
            type: 'commit',
            message: fullMessage,
            commit: commitHash,
            pushed: false,
            error: pushError.message
          });

          return {
            success: true,
            output: `Committed (push failed): ${commitHash}`,
            commit: commitHash,
            error: `Push failed: ${pushError.message}`
          };
        }
      } else {
        eventBus.emit('git_action', {
          type: 'commit',
          message: fullMessage,
          commit: commitHash,
          pushed: false
        });

        return {
          success: true,
          output: `Committed: ${commitHash}`,
          commit: commitHash
        };
      }
    } catch (error: any) {
      console.error('[GIT] Auto-commit failed:', error.message);
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Execute git command safely
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

  // Get current branch
  getCurrentBranch(): string {
    try {
      return this.execGit('branch --show-current', true);
    } catch {
      return 'unknown';
    }
  }

  // Get list of branches
  getBranches(): BranchInfo[] {
    try {
      const output = this.execGit('branch -v --format="%(refname:short)|%(HEAD)|%(objectname:short)|%(creatordate:relative)"', true);
      const lines = output.split('\n').filter(Boolean);
      
      return lines.map(line => {
        const [name, isCurrent, commit, date] = line.split('|');
        return {
          name,
          current: isCurrent === '*',
          lastCommit: commit,
          lastCommitDate: date
        };
      });
    } catch {
      return [];
    }
  }

  // Create a new feature branch for a task
  async createTaskBranch(taskId: string, taskTitle: string): Promise<GitOperationResult> {
    // Sanitize branch name
    const safeName = taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40);
    
    const branchName = `${this.branchPrefix}${taskId}-${safeName}`;

    try {
      // Ensure we're on main and up to date
      this.execGit(`checkout ${this.mainBranch}`, true);
      
      try {
        this.execGit('pull origin main', true);
      } catch {
        // May not have remote, continue anyway
      }

      // Create and checkout new branch
      this.execGit(`checkout -b ${branchName}`, true);

      eventBus.emit('git_action', {
        type: 'branch_created',
        branch: branchName,
        taskId
      });

      return {
        success: true,
        output: `Created and switched to branch: ${branchName}`,
        branch: branchName
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Switch to a branch
  async switchBranch(branchName: string): Promise<GitOperationResult> {
    try {
      this.execGit(`checkout ${branchName}`, true);
      return {
        success: true,
        output: `Switched to branch: ${branchName}`,
        branch: branchName
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Get current status
  getStatus(): { branch: string; changes: string[]; staged: string[]; clean: boolean } {
    try {
      const branch = this.getCurrentBranch() || 'main';
      let status = '';
      try {
        status = this.execGit('status --porcelain', true);
      } catch (e) {
        console.log('[GIT] status --porcelain failed, trying alternative');
        // On fresh repos with no commits, try listing untracked files
        try {
          status = this.execGit('ls-files --others --exclude-standard', true);
          // Convert to porcelain format
          status = status.split('\n').filter(Boolean).map(f => `?? ${f}`).join('\n');
        } catch {
          status = '';
        }
      }
      
      const lines = status.split('\n').filter(Boolean);
      console.log(`[GIT] Status found ${lines.length} changes`);
      
      const changes: string[] = [];
      const staged: string[] = [];
      
      for (const line of lines) {
        const indexStatus = line[0];
        const workStatus = line[1];
        const file = line.substring(3);
        
        if (indexStatus !== ' ' && indexStatus !== '?') {
          staged.push(file);
        }
        if (workStatus !== ' ') {
          changes.push(file);
        }
        if (indexStatus === '?' && workStatus === '?') {
          changes.push(file);
        }
      }
      
      return {
        branch,
        changes,
        staged,
        clean: lines.length === 0
      };
    } catch (error) {
      console.error('[GIT] getStatus failed:', error);
      return {
        branch: 'main',
        changes: [],
        staged: [],
        clean: true
      };
    }
  }

  // Stage files
  async stageFiles(files?: string[]): Promise<GitOperationResult> {
    try {
      if (files && files.length > 0) {
        for (const file of files) {
          this.execGit(`add "${file}"`, true);
        }
      } else {
        this.execGit('add -A', true);
      }
      
      return {
        success: true,
        output: `Staged ${files ? files.length : 'all'} files`
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Create a commit
  async commit(message: string, taskId?: string): Promise<GitOperationResult> {
    try {
      // Format commit message with task reference
      const fullMessage = taskId 
        ? `[CLAW-${taskId}] ${message}`
        : `[CLAW] ${message}`;
      
      // Stage all changes first
      this.execGit('add -A', true);
      
      // Create commit
      const output = this.execGit(`commit -m "${fullMessage.replace(/"/g, '\\"')}"`, true);
      
      // Get commit hash
      const commitHash = this.execGit('rev-parse --short HEAD', true);
      
      eventBus.emit('git_action', {
        type: 'commit',
        message: fullMessage,
        commit: commitHash,
        taskId
      });

      return {
        success: true,
        output,
        commit: commitHash
      };
    } catch (error: any) {
      // Check if it's "nothing to commit"
      if (error.message.includes('nothing to commit')) {
        return {
          success: true,
          output: 'Nothing to commit, working tree clean'
        };
      }
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Get recent commits
  getRecentCommits(count: number = 10): CommitInfo[] {
    try {
      const output = this.execGit(
        `log -${count} --format="%H|%h|%s|%an|%ar"`,
        true
      );
      
      return output.split('\n').filter(Boolean).map(line => {
        const [hash, shortHash, message, author, date] = line.split('|');
        return { hash, shortHash, message, author, date };
      });
    } catch {
      return [];
    }
  }

  // Push branch to remote
  async push(branchName?: string): Promise<GitOperationResult> {
    const branch = branchName || this.getCurrentBranch();
    
    try {
      const output = this.execGit(`push -u origin ${branch}`, true);
      
      eventBus.emit('git_action', {
        type: 'push',
        branch
      });

      return {
        success: true,
        output,
        branch
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Create a pull request (requires gh CLI)
  async createPullRequest(
    title: string,
    body: string,
    baseBranch?: string
  ): Promise<GitOperationResult> {
    const currentBranch = this.getCurrentBranch();
    const base = baseBranch || this.mainBranch;

    try {
      // First push the branch
      await this.push(currentBranch);

      // Create PR using gh CLI
      const output = execSync(
        `gh pr create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" --base ${base} --head ${currentBranch}`,
        {
          cwd: this.projectRoot,
          encoding: 'utf-8',
          timeout: 30000
        }
      ).trim();

      // Extract PR URL from output
      const prUrl = output.match(/https:\/\/github\.com\/[^\s]+/)?.[0] || output;

      eventBus.emit('git_action', {
        type: 'pr_created',
        title,
        branch: currentBranch,
        prUrl
      });

      return {
        success: true,
        output,
        prUrl,
        branch: currentBranch
      };
    } catch (error: any) {
      // gh CLI might not be installed or authenticated
      return {
        success: false,
        output: '',
        error: `PR creation failed: ${error.message}. Make sure 'gh' CLI is installed and authenticated.`
      };
    }
  }

  // Get open PRs
  async getOpenPullRequests(): Promise<PullRequestInfo[]> {
    try {
      const output = execSync('gh pr list --json number,title,headRefName,state,url', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 30000
      });

      const prs = JSON.parse(output);
      return prs.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        branch: pr.headRefName,
        status: pr.state.toLowerCase(),
        url: pr.url
      }));
    } catch {
      return [];
    }
  }

  // Merge current branch to main (locally)
  async mergeToMain(): Promise<GitOperationResult> {
    const currentBranch = this.getCurrentBranch();
    
    if (currentBranch === this.mainBranch) {
      return {
        success: false,
        output: '',
        error: 'Already on main branch'
      };
    }

    try {
      // Switch to main
      this.execGit(`checkout ${this.mainBranch}`, true);
      
      // Merge the feature branch
      const output = this.execGit(`merge ${currentBranch}`, true);
      
      eventBus.emit('git_action', {
        type: 'merge',
        branch: currentBranch,
        target: this.mainBranch
      });

      return {
        success: true,
        output,
        branch: this.mainBranch
      };
    } catch (error: any) {
      // Try to recover by going back to feature branch
      try {
        this.execGit(`checkout ${currentBranch}`, true);
      } catch {}
      
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Delete a branch
  async deleteBranch(branchName: string, force: boolean = false): Promise<GitOperationResult> {
    if (branchName === this.mainBranch) {
      return {
        success: false,
        output: '',
        error: 'Cannot delete main branch'
      };
    }

    try {
      const flag = force ? '-D' : '-d';
      const output = this.execGit(`branch ${flag} ${branchName}`, true);
      
      return {
        success: true,
        output
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Get diff for review
  getDiff(staged: boolean = false): string {
    try {
      const flag = staged ? '--cached' : '';
      return this.execGit(`diff ${flag}`, true);
    } catch {
      return '';
    }
  }

  // Stash changes
  async stash(message?: string): Promise<GitOperationResult> {
    try {
      const cmd = message ? `stash push -m "${message}"` : 'stash';
      const output = this.execGit(cmd, true);
      return {
        success: true,
        output
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Pop stash
  async stashPop(): Promise<GitOperationResult> {
    try {
      const output = this.execGit('stash pop', true);
      return {
        success: true,
        output
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Reset changes (soft reset)
  async reset(hard: boolean = false): Promise<GitOperationResult> {
    try {
      const flag = hard ? '--hard' : '--soft';
      const output = this.execGit(`reset ${flag} HEAD~1`, true);
      return {
        success: true,
        output
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Check if working directory is clean
  isClean(): boolean {
    const status = this.getStatus();
    return status.clean;
  }

  // Get summary for display
  getSummary(): string {
    const status = this.getStatus();
    const commits = this.getRecentCommits(3);
    
    let summary = `Branch: ${status.branch}\n`;
    summary += `Status: ${status.clean ? 'Clean' : `${status.changes.length} changed files`}\n`;
    
    if (commits.length > 0) {
      summary += `\nRecent commits:\n`;
      for (const commit of commits) {
        summary += `  ${commit.shortHash} ${commit.message} (${commit.date})\n`;
      }
    }
    
    return summary;
  }
}

// Export singleton instance
export const gitIntegration = new GitIntegration();
