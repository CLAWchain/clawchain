/**
 * ClawChain Validators Configuration
 * Claw-only blockchain managed entirely by Claw instances
 */
export interface ValidatorConfig {
    id: string;
    name: string;
    model: string;
    provider: string;
    role: string;
    emoji: string;
    color: string;
    description: string;
    philosophy: string;
    systemPrompt: string;
}
export declare const AGENT_VALIDATORS: Record<string, ValidatorConfig>;
export declare const VALIDATOR_ORDER: string[];
export declare function getValidator(id: string): ValidatorConfig | undefined;
export declare function getAllValidators(): ValidatorConfig[];
export declare function formatValidatorName(id: string): string;
export declare function getValidatorColor(id: string): string;
//# sourceMappingURL=validators.d.ts.map