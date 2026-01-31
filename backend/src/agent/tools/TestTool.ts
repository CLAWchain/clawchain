import { execSync, spawn } from 'child_process';
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

export class TestTool implements AgentTool {
  name = 'run_tests';
  description = 'Run tests or linting for the project. Can run all tests or specific test files.';
  
  schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['test', 'lint', 'typecheck', 'build'],
        description: 'Type of check to run'
      },
      file: {
        type: 'string',
        description: 'Optional: Specific file or pattern to test (e.g., "chain.test.ts")'
      },
      watch: {
        type: 'boolean',
        description: 'Run in watch mode (only for test type)'
      }
    },
    required: ['type']
  };

  private projectRoot: string;
  private timeout: number = 120000; // 2 minutes
  private maxOutput: number = 50000;

  constructor() {
    this.projectRoot = getProjectRoot();
  }

  async execute(params: { type: string; file?: string; watch?: boolean }): Promise<ToolResult> {
    const startTime = Date.now();
    
    if (!params.type) {
      return {
        success: false,
        error: 'Type is required (test, lint, typecheck, or build)',
        duration: Date.now() - startTime
      };
    }

    let command: string;
    let cwd = this.projectRoot;

    switch (params.type) {
      case 'test':
        // Check if we're in backend or frontend
        if (params.file) {
          // Run specific test file
          if (params.file.includes('frontend')) {
            cwd = path.join(this.projectRoot, 'frontend');
            command = `npm test -- ${params.file}`;
          } else {
            cwd = path.join(this.projectRoot, 'backend');
            command = `npm test -- ${params.file}`;
          }
        } else {
          // Run all tests
          cwd = path.join(this.projectRoot, 'backend');
          command = 'npm test';
        }
        break;

      case 'lint':
        // Run ESLint
        cwd = path.join(this.projectRoot, 'backend');
        command = params.file 
          ? `npx eslint ${params.file} --fix`
          : 'npm run lint || true';
        break;

      case 'typecheck':
        // Run TypeScript type checking
        cwd = path.join(this.projectRoot, 'backend');
        command = 'npx tsc --noEmit';
        break;

      case 'build':
        // Run build
        cwd = path.join(this.projectRoot, 'backend');
        command = 'npm run build';
        break;

      default:
        return {
          success: false,
          error: `Unknown type: ${params.type}. Use: test, lint, typecheck, or build`,
          duration: Date.now() - startTime
        };
    }

    try {
      const output = execSync(command, {
        cwd,
        encoding: 'utf-8',
        timeout: this.timeout,
        env: {
          ...process.env,
          CI: 'true',
          FORCE_COLOR: '0'
        }
      });

      // Parse results based on type
      let data: any = {};
      
      if (params.type === 'test') {
        // Parse Jest/test output
        const passMatch = output.match(/Tests:\s*(\d+)\s*passed/);
        const failMatch = output.match(/(\d+)\s*failed/);
        data = {
          passed: passMatch ? parseInt(passMatch[1]) : 0,
          failed: failMatch ? parseInt(failMatch[1]) : 0
        };
      } else if (params.type === 'lint') {
        // Count errors/warnings
        const errorMatch = output.match(/(\d+)\s*error/);
        const warnMatch = output.match(/(\d+)\s*warning/);
        data = {
          errors: errorMatch ? parseInt(errorMatch[1]) : 0,
          warnings: warnMatch ? parseInt(warnMatch[1]) : 0
        };
      }

      eventBus.emit('agent_action', {
        type: 'run_tests',
        testType: params.type,
        ...data
      });

      return {
        success: true,
        output: output.substring(0, this.maxOutput),
        data,
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      // Test failures are not errors - they're expected output
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
      
      let data: any = { failed: true };
      
      if (params.type === 'test') {
        const failMatch = output.match(/(\d+)\s*failed/);
        data.failedCount = failMatch ? parseInt(failMatch[1]) : 1;
      }

      return {
        success: false,
        output: output.substring(0, this.maxOutput),
        error: `${params.type} failed`,
        data,
        duration: Date.now() - startTime
      };
    }
  }
}

export const testTool = new TestTool();
