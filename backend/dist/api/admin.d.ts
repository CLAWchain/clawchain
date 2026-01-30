declare const adminRouter: import("express-serve-static-core").Router;
interface ActivityLogEntry {
    timestamp: Date;
    type: 'task_start' | 'task_complete' | 'error' | 'git_action' | 'browser_action' | 'api_call';
    message: string;
    data?: any;
}
export declare function logActivity(type: ActivityLogEntry['type'], message: string, data?: any): void;
export declare function trackApiCall(tokensIn: number, tokensOut: number): void;
export { adminRouter };
//# sourceMappingURL=admin.d.ts.map