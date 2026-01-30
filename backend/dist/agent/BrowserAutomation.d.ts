export interface BrowserResult {
    success: boolean;
    data?: any;
    error?: string;
    screenshot?: string;
    content?: string;
    url?: string;
}
export interface PageInfo {
    url: string;
    title: string;
    status: number;
    loadTime: number;
    screenshot?: string;
}
export interface ElementInfo {
    tag: string;
    text: string;
    attributes: Record<string, string>;
}
export declare const BROWSER_TOOLS: ({
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            url: {
                type: string;
                description: string;
            };
            extract_text: {
                type: string;
                description: string;
            };
            filename?: undefined;
            full_page?: undefined;
            expected_text?: undefined;
            query?: undefined;
            num_results?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            url: {
                type: string;
                description: string;
            };
            filename: {
                type: string;
                description: string;
            };
            full_page: {
                type: string;
                description: string;
            };
            extract_text?: undefined;
            expected_text?: undefined;
            query?: undefined;
            num_results?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            url: {
                type: string;
                description: string;
            };
            expected_text: {
                type: string;
                description: string;
            };
            extract_text?: undefined;
            filename?: undefined;
            full_page?: undefined;
            query?: undefined;
            num_results?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            num_results: {
                type: string;
                description: string;
            };
            url?: undefined;
            extract_text?: undefined;
            filename?: undefined;
            full_page?: undefined;
            expected_text?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            url: {
                type: string;
                description: string;
            };
            extract_text?: undefined;
            filename?: undefined;
            full_page?: undefined;
            expected_text?: undefined;
            query?: undefined;
            num_results?: undefined;
        };
        required: string[];
    };
})[];
export declare class BrowserAutomation {
    private projectRoot;
    private screenshotDir;
    private userAgent;
    constructor(projectRoot?: string);
    browseUrl(url: string, extractText?: boolean): Promise<BrowserResult>;
    screenshotUrl(url: string, filename?: string, fullPage?: boolean): Promise<BrowserResult>;
    checkDeployment(url: string, expectedText?: string): Promise<BrowserResult>;
    searchWeb(query: string, numResults?: number): Promise<BrowserResult>;
    extractLinks(url: string): Promise<BrowserResult>;
    executeTool(toolName: string, args: any): Promise<BrowserResult>;
}
export declare const browserAutomation: BrowserAutomation;
//# sourceMappingURL=BrowserAutomation.d.ts.map