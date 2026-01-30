import * as fs from 'fs';
import * as path from 'path';
import { eventBus } from '../events/EventBus';

// Skill definition
export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  enabled: boolean;
  
  // Tool definitions this skill provides
  tools: SkillTool[];
  
  // Prompts this skill adds to the agent
  systemPromptAddition?: string;
  
  // Scripts that can be executed
  scripts?: SkillScript[];
  
  // Triggers that activate this skill
  triggers?: SkillTrigger[];
}

// Tool provided by a skill
export interface SkillTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: string; // Path to handler script or function name
}

// Script that can be run
export interface SkillScript {
  name: string;
  description: string;
  command: string;
  args?: string[];
}

// Trigger that activates a skill
export interface SkillTrigger {
  type: 'event' | 'schedule' | 'keyword';
  value: string; // Event name, cron expression, or keyword pattern
  action: string; // Script or tool to run
}

// Skill execution result
export interface SkillResult {
  success: boolean;
  output?: any;
  error?: string;
}

// Built-in skills
const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'core-dev',
    name: 'Core Development',
    description: 'Basic development tools for reading, writing, and running code',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'read_file',
        description: 'Read a file from the codebase',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to file' }
          },
          required: ['path']
        },
        handler: 'core:read_file'
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to file' },
            content: { type: 'string', description: 'Content to write' }
          },
          required: ['path', 'content']
        },
        handler: 'core:write_file'
      },
      {
        name: 'run_command',
        description: 'Run a shell command',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Command to run' }
          },
          required: ['command']
        },
        handler: 'core:run_command'
      }
    ]
  },
  {
    id: 'git-ops',
    name: 'Git Operations',
    description: 'Git version control operations',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'git_status',
        description: 'Get current git status',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: 'git:status'
      },
      {
        name: 'git_commit',
        description: 'Create a git commit',
        input_schema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Commit message' }
          },
          required: ['message']
        },
        handler: 'git:commit'
      }
    ]
  },
  {
    id: 'web-browse',
    name: 'Web Browsing',
    description: 'Browse the web, take screenshots, search',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'browse_url',
        description: 'Fetch and read a web page',
        input_schema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to browse' }
          },
          required: ['url']
        },
        handler: 'browser:browse'
      },
      {
        name: 'search_web',
        description: 'Search the web',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        },
        handler: 'browser:search'
      }
    ]
  },
  {
    id: 'blockchain',
    name: 'Blockchain Operations',
    description: 'Interact with ClawChain blockchain',
    version: '1.0.0',
    enabled: true,
    systemPromptAddition: `You have access to ClawChain blockchain operations:
- View chain state and blocks
- Check account balances
- Analyze transactions`,
    tools: [
      {
        name: 'get_chain_status',
        description: 'Get current blockchain status',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: 'chain:status'
      },
      {
        name: 'get_balance',
        description: 'Get account balance',
        input_schema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address' }
          },
          required: ['address']
        },
        handler: 'chain:balance'
      }
    ]
  }
];

export class SkillManager {
  private skills: Map<string, Skill> = new Map();
  private skillsDir: string;
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || path.resolve(__dirname, '../../../../');
    this.skillsDir = path.join(this.projectRoot, 'skills');
  }

  // Initialize skill manager
  async initialize(): Promise<void> {
    console.log('[SKILLS] Initializing skill manager...');
    
    // Load built-in skills
    for (const skill of BUILT_IN_SKILLS) {
      this.skills.set(skill.id, skill);
    }
    console.log(`[SKILLS] Loaded ${BUILT_IN_SKILLS.length} built-in skills`);

    // Load custom skills from directory
    await this.loadCustomSkills();

    // Set up event listeners for triggers
    this.setupTriggers();

    console.log(`[SKILLS] Total skills loaded: ${this.skills.size}`);
  }

  // Load custom skills from skills directory
  private async loadCustomSkills(): Promise<void> {
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
      console.log(`[SKILLS] Created skills directory: ${this.skillsDir}`);
      return;
    }

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const skillPath = path.join(this.skillsDir, entry.name);
      const manifestPath = path.join(skillPath, 'SKILL.json');
      
      if (!fs.existsSync(manifestPath)) {
        // Check for SKILL.md and try to parse it
        const mdPath = path.join(skillPath, 'SKILL.md');
        if (fs.existsSync(mdPath)) {
          const skill = this.parseSkillMarkdown(mdPath, entry.name);
          if (skill) {
            this.skills.set(skill.id, skill);
            console.log(`[SKILLS] Loaded custom skill from markdown: ${skill.name}`);
          }
        }
        continue;
      }

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const skill: Skill = {
          id: manifest.id || entry.name,
          name: manifest.name || entry.name,
          description: manifest.description || '',
          version: manifest.version || '1.0.0',
          author: manifest.author,
          enabled: manifest.enabled !== false,
          tools: manifest.tools || [],
          systemPromptAddition: manifest.systemPrompt,
          scripts: manifest.scripts,
          triggers: manifest.triggers
        };

        this.skills.set(skill.id, skill);
        console.log(`[SKILLS] Loaded custom skill: ${skill.name}`);
      } catch (error) {
        console.error(`[SKILLS] Failed to load skill ${entry.name}:`, error);
      }
    }
  }

  // Parse a SKILL.md file into a Skill object
  private parseSkillMarkdown(mdPath: string, dirName: string): Skill | null {
    try {
      const content = fs.readFileSync(mdPath, 'utf-8');
      
      // Extract name from first heading
      const nameMatch = content.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : dirName;

      // Extract description
      const descMatch = content.match(/^#[^#].*\n+([^#\n].*)/m);
      const description = descMatch ? descMatch[1].trim() : '';

      // Look for tool definitions in code blocks
      const tools: SkillTool[] = [];
      const toolBlockRegex = /```(?:json|javascript)\s*\n([\s\S]*?)```/g;
      let match;
      
      while ((match = toolBlockRegex.exec(content)) !== null) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.name && parsed.description) {
            tools.push({
              name: parsed.name,
              description: parsed.description,
              input_schema: parsed.input_schema || { type: 'object', properties: {}, required: [] },
              handler: parsed.handler || `${dirName}:${parsed.name}`
            });
          }
        } catch {
          // Not valid JSON, skip
        }
      }

      return {
        id: dirName,
        name,
        description,
        version: '1.0.0',
        enabled: true,
        tools
      };
    } catch (error) {
      console.error(`[SKILLS] Failed to parse ${mdPath}:`, error);
      return null;
    }
  }

  // Set up event triggers
  private setupTriggers(): void {
    for (const skill of this.skills.values()) {
      if (!skill.enabled || !skill.triggers) continue;

      for (const trigger of skill.triggers) {
        if (trigger.type === 'event') {
          eventBus.on(trigger.value, (data: any) => {
            this.executeTrigger(skill, trigger, data);
          });
        }
        // Schedule and keyword triggers would need additional implementation
      }
    }
  }

  // Execute a trigger
  private async executeTrigger(skill: Skill, trigger: SkillTrigger, data: any): Promise<void> {
    console.log(`[SKILLS] Trigger fired for ${skill.name}: ${trigger.value}`);
    eventBus.emit('skill_trigger', {
      skill: skill.id,
      trigger: trigger.value,
      action: trigger.action
    });
  }

  // Get all enabled skills
  getEnabledSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.enabled);
  }

  // Get all tools from enabled skills
  getAllTools(): SkillTool[] {
    const tools: SkillTool[] = [];
    for (const skill of this.getEnabledSkills()) {
      tools.push(...skill.tools);
    }
    return tools;
  }

  // Get combined system prompt additions
  getSystemPromptAdditions(): string {
    const additions: string[] = [];
    for (const skill of this.getEnabledSkills()) {
      if (skill.systemPromptAddition) {
        additions.push(`## ${skill.name}\n${skill.systemPromptAddition}`);
      }
    }
    return additions.join('\n\n');
  }

  // Get a specific skill
  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  // Enable a skill
  enableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = true;
      return true;
    }
    return false;
  }

  // Disable a skill
  disableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = false;
      return true;
    }
    return false;
  }

  // Add a new skill dynamically
  addSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
    console.log(`[SKILLS] Added skill: ${skill.name}`);
    eventBus.emit('skill_added', { skill: skill.id });
  }

  // Remove a skill
  removeSkill(id: string): boolean {
    if (this.skills.has(id)) {
      this.skills.delete(id);
      console.log(`[SKILLS] Removed skill: ${id}`);
      eventBus.emit('skill_removed', { skill: id });
      return true;
    }
    return false;
  }

  // List all skills
  listSkills(): { id: string; name: string; description: string; enabled: boolean; toolCount: number }[] {
    return Array.from(this.skills.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      enabled: s.enabled,
      toolCount: s.tools.length
    }));
  }

  // Execute a skill script
  async executeScript(skillId: string, scriptName: string, args: string[] = []): Promise<SkillResult> {
    const skill = this.skills.get(skillId);
    if (!skill || !skill.scripts) {
      return { success: false, error: 'Skill or script not found' };
    }

    const script = skill.scripts.find(s => s.name === scriptName);
    if (!script) {
      return { success: false, error: `Script ${scriptName} not found in skill ${skillId}` };
    }

    const skillDir = path.join(this.skillsDir, skillId);
    const { execSync } = require('child_process');

    try {
      const command = `${script.command} ${args.join(' ')}`;
      const output = execSync(command, {
        cwd: skillDir,
        encoding: 'utf-8',
        timeout: 30000
      });

      return { success: true, output };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton
export const skillManager = new SkillManager();
