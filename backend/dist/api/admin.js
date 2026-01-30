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
exports.adminRouter = void 0;
exports.logActivity = logActivity;
exports.trackApiCall = trackApiCall;
const express_1 = require("express");
const os = __importStar(require("os"));
const db_1 = require("../database/db");
const AgentWorker_1 = require("../agent/AgentWorker");
const AgentMemory_1 = require("../agent/AgentMemory");
const GitIntegration_1 = require("../agent/GitIntegration");
const CIMonitor_1 = require("../agent/CIMonitor");
const TaskSources_1 = require("../agent/TaskSources");
const adminRouter = (0, express_1.Router)();
exports.adminRouter = adminRouter;
let apiUsage = {
    totalCalls: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    lastReset: new Date(),
    callsByHour: {}
};
const activityLog = [];
const MAX_LOG_ENTRIES = 100;
// Add to activity log
function logActivity(type, message, data) {
    activityLog.unshift({
        timestamp: new Date(),
        type,
        message,
        data
    });
    // Keep log size bounded
    if (activityLog.length > MAX_LOG_ENTRIES) {
        activityLog.pop();
    }
}
// Track API call
function trackApiCall(tokensIn, tokensOut) {
    apiUsage.totalCalls++;
    apiUsage.totalTokensIn += tokensIn;
    apiUsage.totalTokensOut += tokensOut;
    const hour = new Date().toISOString().slice(0, 13);
    apiUsage.callsByHour[hour] = (apiUsage.callsByHour[hour] || 0) + 1;
}
// System health endpoint
adminRouter.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: []
    };
    // Check database
    try {
        await db_1.db.query('SELECT 1');
        health.checks.push({ name: 'Database', status: 'ok', details: 'Connected' });
    }
    catch (e) {
        health.checks.push({ name: 'Database', status: 'error', details: 'Not connected' });
        health.status = 'degraded';
    }
    // Check Redis
    try {
        const isConnected = db_1.cache.isConnected();
        health.checks.push({
            name: 'Redis',
            status: isConnected ? 'ok' : 'warning',
            details: isConnected ? 'Connected' : 'Not connected (using fallback)'
        });
    }
    catch (e) {
        health.checks.push({ name: 'Redis', status: 'warning', details: 'Not available' });
    }
    // Check agent
    const agentState = AgentWorker_1.agentWorker.getState();
    health.checks.push({
        name: 'Agent',
        status: 'ok',
        details: agentState.isWorking ? `Working on: ${agentState.currentTask?.title}` : 'Idle'
    });
    // Memory usage
    const memUsage = process.memoryUsage();
    const memPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    health.checks.push({
        name: 'Memory',
        status: memPercent > 90 ? 'warning' : 'ok',
        details: `${memPercent}% heap used (${Math.round(memUsage.heapUsed / 1024 / 1024)}MB)`
    });
    // Set overall status
    if (health.checks.some(c => c.status === 'error')) {
        health.status = 'unhealthy';
    }
    else if (health.checks.some(c => c.status === 'warning')) {
        health.status = 'degraded';
    }
    res.json(health);
});
// System stats endpoint
adminRouter.get('/stats', async (req, res) => {
    const agentState = AgentWorker_1.agentWorker.getState();
    const memUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    // Get completed tasks count from database
    let totalTasks = 0;
    try {
        const result = await db_1.db.query('SELECT COUNT(*) as count FROM agent_completed_tasks');
        totalTasks = parseInt(result.rows[0]?.count || '0', 10);
    }
    catch (e) {
        totalTasks = agentState.completedTasks.length;
    }
    res.json({
        agent: {
            isWorking: agentState.isWorking,
            currentTask: agentState.currentTask?.title || null,
            completedTasks: totalTasks,
            brainActive: agentState.brainActive,
            uptime: process.uptime()
        },
        system: {
            platform: os.platform(),
            nodeVersion: process.version,
            memory: {
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024)
            },
            cpu: {
                loadAvg1m: cpuUsage[0].toFixed(2),
                loadAvg5m: cpuUsage[1].toFixed(2),
                loadAvg15m: cpuUsage[2].toFixed(2),
                cores: os.cpus().length
            }
        },
        api: {
            totalCalls: apiUsage.totalCalls,
            tokensIn: apiUsage.totalTokensIn,
            tokensOut: apiUsage.totalTokensOut,
            estimatedCost: estimateCost(apiUsage.totalTokensIn, apiUsage.totalTokensOut),
            lastReset: apiUsage.lastReset
        }
    });
});
// Estimate API cost (Haiku pricing)
function estimateCost(tokensIn, tokensOut) {
    // Claude 3 Haiku: $0.25/1M input, $1.25/1M output
    const inputCost = (tokensIn / 1000000) * 0.25;
    const outputCost = (tokensOut / 1000000) * 1.25;
    return `$${(inputCost + outputCost).toFixed(4)}`;
}
// Activity log endpoint
adminRouter.get('/activity', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    let filtered = activityLog;
    if (type) {
        filtered = activityLog.filter(e => e.type === type);
    }
    res.json({
        entries: filtered.slice(0, limit),
        total: activityLog.length
    });
});
// Git status endpoint
adminRouter.get('/git', (req, res) => {
    const status = GitIntegration_1.gitIntegration.getStatus();
    const commits = GitIntegration_1.gitIntegration.getRecentCommits(10);
    const summary = GitIntegration_1.gitIntegration.getSummary();
    res.json({
        branch: status.branch,
        clean: status.clean,
        changes: status.changes.length,
        staged: status.staged.length,
        recentCommits: commits,
        summary
    });
});
// CI status endpoint
adminRouter.get('/ci', async (req, res) => {
    const status = CIMonitor_1.ciMonitor.getStatus();
    res.json(status);
});
// Run CI checks
adminRouter.post('/ci/run', async (req, res) => {
    logActivity('api_call', 'Manual CI run triggered');
    const results = await CIMonitor_1.ciMonitor.runAllChecks();
    res.json(results);
});
// Pending tasks endpoint
adminRouter.get('/tasks', async (req, res) => {
    const tasks = await TaskSources_1.taskSources.collectAllTasks();
    res.json({
        pending: tasks.length,
        tasks: tasks.slice(0, 20).map(t => ({
            id: t.id,
            source: t.source,
            title: t.title,
            priority: t.priority,
            createdAt: t.createdAt
        }))
    });
});
// Memory summary endpoint
adminRouter.get('/memory', async (req, res) => {
    const summary = await AgentMemory_1.agentMemory.getSummary();
    const completedTasks = AgentMemory_1.agentMemory.getCompletedTasks(20);
    res.json({
        summary,
        recentTasks: completedTasks.map(t => ({
            id: t.taskId,
            title: t.title,
            type: t.taskType,
            completedAt: t.completedAt
        }))
    });
});
// Reset API usage stats
adminRouter.post('/reset-stats', (req, res) => {
    apiUsage = {
        totalCalls: 0,
        totalTokensIn: 0,
        totalTokensOut: 0,
        lastReset: new Date(),
        callsByHour: {}
    };
    logActivity('api_call', 'API stats reset');
    res.json({ success: true, message: 'Stats reset' });
});
// Debug endpoints
adminRouter.get('/debug/env', (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasRedisUrl: !!process.env.REDIS_URL,
        port: process.env.PORT || 4000
    });
});
adminRouter.get('/debug/processes', (req, res) => {
    res.json({
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
        argv: process.argv,
        execPath: process.execPath,
        cwd: process.cwd()
    });
});
//# sourceMappingURL=admin.js.map