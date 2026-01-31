/**
 * Agent Tools - Real code execution capabilities for autonomous development
 * 
 * These tools allow the CLAW agent to:
 * - Read and write files in the codebase
 * - Execute commands (npm, git, etc.)
 * - Run tests and linting
 * - Create git commits and branches
 * 
 * Safety boundaries prevent dangerous operations while enabling real development work.
 */

// Export all tools
export { FileReadTool, fileReadTool } from './FileReadTool';
export { FileWriteTool, fileWriteTool } from './FileWriteTool';
export { CommandTool, commandTool } from './CommandTool';
export { GitTool, gitTool } from './GitTool';
export { TestTool, testTool } from './TestTool';
export { SearchTool, searchTool } from './SearchTool';

// Tool result interface
export interface ToolResult {
  success: boolean;
  output?: string;
  error?: string;
  data?: any;
  duration: number;
}

// Base tool interface
export interface AgentTool {
  name: string;
  description: string;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute(params: any): Promise<ToolResult>;
}

// Tool registry for easy access
export const toolRegistry: Map<string, AgentTool> = new Map();

// Initialize tools when module loads
import { fileReadTool } from './FileReadTool';
import { fileWriteTool } from './FileWriteTool';
import { commandTool } from './CommandTool';
import { gitTool } from './GitTool';
import { testTool } from './TestTool';
import { searchTool } from './SearchTool';

toolRegistry.set('read_file', fileReadTool);
toolRegistry.set('write_file', fileWriteTool);
toolRegistry.set('run_command', commandTool);
toolRegistry.set('git', gitTool);
toolRegistry.set('run_tests', testTool);
toolRegistry.set('search_code', searchTool);

// Get tool by name
export function getTool(name: string): AgentTool | undefined {
  return toolRegistry.get(name);
}

// Execute a tool by name
export async function executeTool(name: string, params: any): Promise<ToolResult> {
  const tool = toolRegistry.get(name);
  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${name}`,
      duration: 0
    };
  }
  return tool.execute(params);
}

// Get all tool definitions for Claude API
export function getToolDefinitions(): any[] {
  return Array.from(toolRegistry.values()).map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.schema
  }));
}

console.log('[TOOLS] Agent tool system initialized');
