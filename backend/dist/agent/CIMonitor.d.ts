export interface TestResult {
    passed: boolean;
    total: number;
    passing: number;
    failing: number;
    duration: number;
    failures: TestFailure[];
}
export interface TestFailure {
    testName: string;
    file: string;
    message: string;
    stack?: string;
}
export interface BuildResult {
    success: boolean;
    duration: number;
    errors: string[];
    warnings: string[];
}
export interface LintResult {
    clean: boolean;
    errorCount: number;
    warningCount: number;
    issues: LintIssue[];
}
export interface LintIssue {
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
    message: string;
    rule: string;
}
export declare class CIMonitor {
    private projectRoot;
    private isRunning;
    private checkInterval;
    constructor(projectRoot?: string);
    runAllChecks(): Promise<{
        tests: TestResult;
        build: BuildResult;
        lint: LintResult;
    }>;
    runTests(): Promise<TestResult>;
    runBuild(): Promise<BuildResult>;
    runLint(): Promise<LintResult>;
    start(intervalMs?: number): void;
    stop(): void;
    private handleResults;
    getStatus(): {
        running: boolean;
        lastCheck?: Date;
    };
    quickCheck(): Promise<boolean>;
}
export declare const ciMonitor: CIMonitor;
//# sourceMappingURL=CIMonitor.d.ts.map