import { Request, Response, NextFunction } from 'express';
declare const authRouter: import("express-serve-static-core").Router;
export declare function initializeAuthTables(): Promise<void>;
export declare function apiKeyAuth(requiredPermission?: string): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function ipRateLimit(maxRequests?: number): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { authRouter };
//# sourceMappingURL=auth.d.ts.map