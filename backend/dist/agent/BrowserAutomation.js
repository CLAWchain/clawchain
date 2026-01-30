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
exports.browserAutomation = exports.BrowserAutomation = exports.BROWSER_TOOLS = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const EventBus_1 = require("../events/EventBus");
// Browser tools for the agent
exports.BROWSER_TOOLS = [
    {
        name: 'browse_url',
        description: 'Fetch and read the content of a web page. Returns the text content and basic page info.',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The URL to browse'
                },
                extract_text: {
                    type: 'boolean',
                    description: 'Whether to extract text content (default: true)'
                }
            },
            required: ['url']
        }
    },
    {
        name: 'screenshot_url',
        description: 'Take a screenshot of a web page. Useful for verifying UI changes or checking deployed sites.',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The URL to screenshot'
                },
                filename: {
                    type: 'string',
                    description: 'Output filename (default: screenshot.png)'
                },
                full_page: {
                    type: 'boolean',
                    description: 'Capture full page or just viewport (default: false)'
                }
            },
            required: ['url']
        }
    },
    {
        name: 'check_deployment',
        description: 'Verify that a deployed website is working correctly. Checks HTTP status, load time, and basic content.',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The deployment URL to check'
                },
                expected_text: {
                    type: 'string',
                    description: 'Text that should appear on the page (optional)'
                }
            },
            required: ['url']
        }
    },
    {
        name: 'search_web',
        description: 'Search the web for information. Returns summarized search results.',
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query'
                },
                num_results: {
                    type: 'number',
                    description: 'Number of results to return (default: 5)'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'extract_links',
        description: 'Extract all links from a web page.',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The URL to extract links from'
                }
            },
            required: ['url']
        }
    }
];
class BrowserAutomation {
    constructor(projectRoot) {
        this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        this.projectRoot = projectRoot || path.resolve(__dirname, '../../../../');
        this.screenshotDir = path.join(this.projectRoot, 'screenshots');
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }
    // Fetch a URL and extract content using curl + basic parsing
    async browseUrl(url, extractText = true) {
        const startTime = Date.now();
        try {
            // Use curl to fetch the page
            const response = (0, child_process_1.execSync)(`curl -sL -A "${this.userAgent}" -w "\\n%{http_code}\\n%{time_total}" --max-time 30 "${url}"`, { encoding: 'utf-8', timeout: 35000, maxBuffer: 10 * 1024 * 1024 });
            const lines = response.split('\n');
            const timeTotal = parseFloat(lines.pop() || '0');
            const statusCode = parseInt(lines.pop() || '0', 10);
            const html = lines.join('\n');
            // Extract title
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : 'No title';
            // Extract text content if requested
            let textContent = '';
            if (extractText) {
                // Remove scripts, styles, and tags
                textContent = html
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 5000); // Limit content length
            }
            EventBus_1.eventBus.emit('browser_action', {
                type: 'browse',
                url,
                status: statusCode,
                loadTime: timeTotal
            });
            return {
                success: statusCode >= 200 && statusCode < 400,
                url,
                data: {
                    title,
                    status: statusCode,
                    loadTime: Math.round(timeTotal * 1000),
                    contentLength: html.length
                },
                content: textContent || undefined
            };
        }
        catch (error) {
            return {
                success: false,
                url,
                error: error.message
            };
        }
    }
    // Take a screenshot using a headless browser approach
    // Falls back to a simple HTML-to-image if puppeteer isn't available
    async screenshotUrl(url, filename = 'screenshot.png', fullPage = false) {
        const outputPath = path.join(this.screenshotDir, filename);
        try {
            // Try using puppeteer if available
            const puppeteerScript = `
        const puppeteer = require('puppeteer');
        (async () => {
          const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          const page = await browser.newPage();
          await page.setViewport({ width: 1280, height: 800 });
          await page.goto('${url}', { waitUntil: 'networkidle2', timeout: 30000 });
          await page.screenshot({ 
            path: '${outputPath}',
            fullPage: ${fullPage}
          });
          await browser.close();
          console.log('Screenshot saved');
        })();
      `;
            (0, child_process_1.execSync)(`node -e "${puppeteerScript.replace(/\n/g, ' ')}"`, {
                cwd: this.projectRoot,
                timeout: 60000,
                encoding: 'utf-8'
            });
            EventBus_1.eventBus.emit('browser_action', {
                type: 'screenshot',
                url,
                output: outputPath
            });
            return {
                success: true,
                url,
                screenshot: outputPath,
                data: {
                    path: outputPath,
                    filename
                }
            };
        }
        catch (puppeteerError) {
            // Fallback: use wkhtmltoimage if available
            try {
                (0, child_process_1.execSync)(`wkhtmltoimage --quality 80 "${url}" "${outputPath}"`, {
                    timeout: 60000
                });
                return {
                    success: true,
                    url,
                    screenshot: outputPath,
                    data: {
                        path: outputPath,
                        filename,
                        method: 'wkhtmltoimage'
                    }
                };
            }
            catch (fallbackError) {
                // Final fallback: just fetch the page and report we can't screenshot
                const browseResult = await this.browseUrl(url, true);
                return {
                    success: false,
                    url,
                    error: 'Screenshot not available (puppeteer/wkhtmltoimage not installed). Page content fetched instead.',
                    content: browseResult.content,
                    data: browseResult.data
                };
            }
        }
    }
    // Check if a deployment is working
    async checkDeployment(url, expectedText) {
        const startTime = Date.now();
        const checks = [];
        try {
            // Check 1: HTTP response
            const response = await this.browseUrl(url, true);
            checks.push({
                name: 'HTTP Response',
                passed: response.success,
                details: response.success
                    ? `Status ${response.data?.status}, loaded in ${response.data?.loadTime}ms`
                    : `Failed: ${response.error}`
            });
            // Check 2: Page has content
            const hasContent = !!(response.content && response.content.length > 100);
            checks.push({
                name: 'Page Content',
                passed: hasContent,
                details: hasContent
                    ? `${response.content?.length} characters of content`
                    : 'Page appears empty or minimal'
            });
            // Check 3: Expected text (if provided)
            if (expectedText) {
                const hasExpectedText = response.content?.toLowerCase().includes(expectedText.toLowerCase());
                checks.push({
                    name: 'Expected Text',
                    passed: !!hasExpectedText,
                    details: hasExpectedText
                        ? `Found "${expectedText}"`
                        : `Did not find "${expectedText}"`
                });
            }
            // Check 4: Load time
            const loadTime = response.data?.loadTime || 0;
            const fastEnough = loadTime < 5000;
            checks.push({
                name: 'Load Time',
                passed: fastEnough,
                details: fastEnough
                    ? `${loadTime}ms (good)`
                    : `${loadTime}ms (slow)`
            });
            const allPassed = checks.every(c => c.passed);
            const duration = Date.now() - startTime;
            EventBus_1.eventBus.emit('browser_action', {
                type: 'deployment_check',
                url,
                passed: allPassed,
                checks
            });
            return {
                success: allPassed,
                url,
                data: {
                    checks,
                    duration,
                    title: response.data?.title,
                    summary: allPassed
                        ? 'All deployment checks passed!'
                        : `${checks.filter(c => !c.passed).length} check(s) failed`
                }
            };
        }
        catch (error) {
            return {
                success: false,
                url,
                error: error.message,
                data: { checks }
            };
        }
    }
    // Search the web using DuckDuckGo HTML (no API key needed)
    async searchWeb(query, numResults = 5) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
            const response = (0, child_process_1.execSync)(`curl -sL -A "${this.userAgent}" --max-time 15 "${searchUrl}"`, { encoding: 'utf-8', timeout: 20000, maxBuffer: 5 * 1024 * 1024 });
            // Parse DuckDuckGo HTML results
            const results = [];
            // Match result blocks
            const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]+)<\/a>/gi;
            let match;
            while ((match = resultRegex.exec(response)) !== null && results.length < numResults) {
                results.push({
                    url: match[1],
                    title: match[2].trim(),
                    snippet: match[3].trim()
                });
            }
            // Fallback: simpler parsing
            if (results.length === 0) {
                const linkRegex = /<a[^>]*class="result__url"[^>]*href="([^"]+)"[^>]*>/gi;
                const titleRegex = /<a[^>]*class="result__a"[^>]*>([^<]+)<\/a>/gi;
                const urls = [];
                const titles = [];
                while ((match = linkRegex.exec(response)) !== null)
                    urls.push(match[1]);
                while ((match = titleRegex.exec(response)) !== null)
                    titles.push(match[1]);
                for (let i = 0; i < Math.min(urls.length, titles.length, numResults); i++) {
                    results.push({
                        url: urls[i],
                        title: titles[i],
                        snippet: ''
                    });
                }
            }
            EventBus_1.eventBus.emit('browser_action', {
                type: 'search',
                query,
                resultCount: results.length
            });
            return {
                success: results.length > 0,
                data: {
                    query,
                    resultCount: results.length,
                    results
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Extract all links from a page
    async extractLinks(url) {
        try {
            const response = await this.browseUrl(url, false);
            if (!response.success) {
                return response;
            }
            // Re-fetch to get full HTML
            const html = (0, child_process_1.execSync)(`curl -sL -A "${this.userAgent}" --max-time 30 "${url}"`, { encoding: 'utf-8', timeout: 35000, maxBuffer: 10 * 1024 * 1024 });
            // Extract links
            const links = [];
            const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                let href = match[1];
                const text = match[2].trim();
                // Skip empty or javascript links
                if (!href || href.startsWith('javascript:') || href === '#')
                    continue;
                // Make relative URLs absolute
                if (href.startsWith('/')) {
                    const urlObj = new URL(url);
                    href = `${urlObj.origin}${href}`;
                }
                else if (!href.startsWith('http')) {
                    continue; // Skip other relative URLs for simplicity
                }
                links.push({ href, text: text || href });
            }
            // Deduplicate
            const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());
            return {
                success: true,
                url,
                data: {
                    linkCount: uniqueLinks.length,
                    links: uniqueLinks.slice(0, 50) // Limit to 50 links
                }
            };
        }
        catch (error) {
            return {
                success: false,
                url,
                error: error.message
            };
        }
    }
    // Execute a browser tool
    async executeTool(toolName, args) {
        console.log(`[BROWSER] Executing tool: ${toolName}`, args);
        switch (toolName) {
            case 'browse_url':
                return this.browseUrl(args.url, args.extract_text !== false);
            case 'screenshot_url':
                return this.screenshotUrl(args.url, args.filename, args.full_page);
            case 'check_deployment':
                return this.checkDeployment(args.url, args.expected_text);
            case 'search_web':
                return this.searchWeb(args.query, args.num_results || 5);
            case 'extract_links':
                return this.extractLinks(args.url);
            default:
                return {
                    success: false,
                    error: `Unknown browser tool: ${toolName}`
                };
        }
    }
}
exports.BrowserAutomation = BrowserAutomation;
// Export singleton
exports.browserAutomation = new BrowserAutomation();
//# sourceMappingURL=BrowserAutomation.js.map