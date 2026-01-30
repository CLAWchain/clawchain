"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ciMonitor = exports.CIMonitor = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const EventBus_1 = require("../events/EventBus");
class CIMonitor {
    constructor(projectRoot) {
        this.isRunning = false;
        this.checkInterval = null;
        this.projectRoot = projectRoot || path.resolve(__dirname, '../../../../');
    }
    // Run all CI checks
    async runAllChecks() {
        console.log('[CI] Running all checks...');
        const [tests, build, lint] = await Promise.all([
            this.runTests(),
            this.runBuild(),
            this.runLint()
        ]);
        // Emit results
        EventBus_1.eventBus.emit('ci_results', { tests, build, lint });
        return { tests, build, lint };
    }
    // Run tests
    async runTests() {
        console.log('[CI] Running tests...');
        const startTime = Date.now();
        try {
            const output = (0, child_process_1.execSync)('npm test 2>&1 || true', {
                cwd: this.projectRoot,
                encoding: 'utf-8',
                timeout: 120000
            });
            const duration = Date.now() - startTime;
            // Parse test output
            const failures = [];
            let total = 0;
            let passing = 0;
            let failing = 0;
            // Try to parse Jest output
            const summaryMatch = output.match(/Tests:\s*(\d+)\s*passed,\s*(\d+)\s*total/);
            if (summaryMatch) {
                passing = parseInt(summaryMatch[1], 10);
                total = parseInt(summaryMatch[2], 10);
                failing = total - passing;
            }
            // Alternative: count PASS/FAIL lines
            if (total === 0) {
                const passMatches = output.match(/PASS/g) || [];
                const failMatches = output.match(/FAIL/g) || [];
                passing = passMatches.length;
                failing = failMatches.length;
                total = passing + failing;
            }
            // Extract failures
            const failureBlocks = output.split(/FAIL/).slice(1);
            for (const block of failureBlocks.slice(0, 5)) {
                const lines = block.split('\n');
                const file = lines[0]?.trim() || 'unknown';
                // Find error messages
                for (const line of lines) {
                    if (line.includes('Error:') || line.includes('✕')) {
                        failures.push({
                            testName: line.trim(),
                            file,
                            message: line.trim()
                        });
                        break;
                    }
                }
            }
            const result = {
                passed: failing === 0 && total > 0,
                total,
                passing,
                failing,
                duration,
                failures
            };
            console.log(`[CI] Tests: ${passing}/${total} passed (${duration}ms)`);
            return result;
        }
        catch (error) {
            return {
                passed: false,
                total: 0,
                passing: 0,
                failing: 1,
                duration: Date.now() - startTime,
                failures: [{
                        testName: 'Test execution',
                        file: 'unknown',
                        message: error.message
                    }]
            };
        }
    }
    // Run build
    async runBuild() {
        console.log('[CI] Running build...');
        const startTime = Date.now();
        try {
            const output = (0, child_process_1.execSync)('npm run build 2>&1 || true', {
                cwd: this.projectRoot,
                encoding: 'utf-8',
                timeout: 180000
            });
            const duration = Date.now() - startTime;
            const errors = [];
            const warnings = [];
            // Parse TypeScript errors
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.includes('error TS') || line.includes('Error:')) {
                    errors.push(line.trim());
                }
                else if (line.includes('warning') || line.includes('Warning')) {
                    warnings.push(line.trim());
                }
            }
            const result = {
                success: errors.length === 0,
                duration,
                errors: errors.slice(0, 10),
                warnings: warnings.slice(0, 10)
            };
            console.log(`[CI] Build: ${result.success ? 'SUCCESS' : 'FAILED'} (${duration}ms, ${errors.length} errors)`);
            return result;
        }
        catch (error) {
            return {
                success: false,
                duration: Date.now() - startTime,
                errors: [error.message],
                warnings: []
            };
        }
    }
    // Run lint
    async runLint() {
        console.log('[CI] Running lint...');
        try {
            const output = (0, child_process_1.execSync)('npm run lint 2>&1 || true', {
                cwd: this.projectRoot,
                encoding: 'utf-8',
                timeout: 60000
            });
            const issues = [];
            let errorCount = 0;
            let warningCount = 0;
            // Parse ESLint output
            const lines = output.split('\n');
            for (const line of lines) {
                // Match ESLint format: file:line:column: message (rule)
                const match = line.match(/(.+?):(\d+):(\d+):\s*(error|warning)\s+(.+?)\s+(\S+)$/);
                if (match) {
                    const [, file, lineNum, column, severity, message, rule] = match;
                    issues.push({
                        file,
                        line: parseInt(lineNum, 10),
                        column: parseInt(column, 10),
                        severity: severity,
                        message,
                        rule
                    });
                    if (severity === 'error') {
                        errorCount++;
                    }
                    else {
                        warningCount++;
                    }
                }
            }
            const result = {
                clean: errorCount === 0 && warningCount === 0,
                errorCount,
                warningCount,
                issues: issues.slice(0, 20)
            };
            console.log(`[CI] Lint: ${result.clean ? 'CLEAN' : `${errorCount} errors, ${warningCount} warnings`}`);
            return result;
        }
        catch (error) {
            return {
                clean: false,
                errorCount: 1,
                warningCount: 0,
                issues: [{
                        file: 'unknown',
                        line: 0,
                        column: 0,
                        severity: 'error',
                        message: error.message,
                        rule: 'execution-error'
                    }]
            };
        }
    }
    // Start periodic monitoring
    start(intervalMs = 300000) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log(`[CI] Starting periodic monitoring every ${intervalMs / 1000}s`);
        // Run initial check
        this.runAllChecks().then(results => {
            this.handleResults(results);
        });
        // Set up interval
        this.checkInterval = setInterval(async () => {
            const results = await this.runAllChecks();
            this.handleResults(results);
        }, intervalMs);
    }
    // Stop monitoring
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isRunning = false;
        console.log('[CI] Monitoring stopped');
    }
    // Handle CI results - create tasks for failures
    handleResults(results) {
        // If tests failed, this will be picked up by TaskSources
        if (!results.tests.passed && results.tests.failing > 0) {
            console.log('[CI] Test failures detected - TaskSources will create fix task');
            EventBus_1.eventBus.emit('ci_failure', {
                type: 'tests',
                failures: results.tests.failures
            });
        }
        if (!results.build.success) {
            console.log('[CI] Build errors detected - TaskSources will create fix task');
            EventBus_1.eventBus.emit('ci_failure', {
                type: 'build',
                errors: results.build.errors
            });
        }
        if (!results.lint.clean && results.lint.errorCount > 0) {
            console.log('[CI] Lint errors detected - TaskSources will create fix task');
            EventBus_1.eventBus.emit('ci_failure', {
                type: 'lint',
                issues: results.lint.issues
            });
        }
    }
    // Get current status
    getStatus() {
        return {
            running: this.isRunning
        };
    }
    // Quick health check (faster than full CI run)
    async quickCheck() {
        try {
            // Just check if TypeScript compiles
            (0, child_process_1.execSync)('npx tsc --noEmit 2>&1', {
                cwd: this.projectRoot,
                encoding: 'utf-8',
                timeout: 60000
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.CIMonitor = CIMonitor;
// Export singleton
exports.ciMonitor = new CIMonitor();
//# sourceMappingURL=CIMonitor.js.map