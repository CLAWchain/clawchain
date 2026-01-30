export interface Skill {
    id: string;
    name: string;
    description: string;
    version: string;
    author?: string;
    enabled: boolean;
    tools: SkillTool[];
    systemPromptAddition?: string;
    scripts?: SkillScript[];
    triggers?: SkillTrigger[];
}
export interface SkillTool {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
    handler: string;
}
export interface SkillScript {
    name: string;
    description: string;
    command: string;
    args?: string[];
}
export interface SkillTrigger {
    type: 'event' | 'schedule' | 'keyword';
    value: string;
    action: string;
}
export interface SkillResult {
    success: boolean;
    output?: any;
    error?: string;
}
export declare class SkillManager {
    private skills;
    private skillsDir;
    private projectRoot;
    constructor(projectRoot?: string);
    initialize(): Promise<void>;
    private loadCustomSkills;
    private parseSkillMarkdown;
    private setupTriggers;
    private executeTrigger;
    getEnabledSkills(): Skill[];
    getAllTools(): SkillTool[];
    getSystemPromptAdditions(): string;
    getSkill(id: string): Skill | undefined;
    enableSkill(id: string): boolean;
    disableSkill(id: string): boolean;
    addSkill(skill: Skill): void;
    removeSkill(id: string): boolean;
    listSkills(): {
        id: string;
        name: string;
        description: string;
        enabled: boolean;
        toolCount: number;
    }[];
    executeScript(skillId: string, scriptName: string, args?: string[]): Promise<SkillResult>;
}
export declare const skillManager: SkillManager;
//# sourceMappingURL=SkillManager.d.ts.map