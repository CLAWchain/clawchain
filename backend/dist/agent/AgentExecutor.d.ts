export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    exitCode?: number;
    duration: number;
}
export interface FileResult {
    success: boolean;
    path: string;
    content?: string;
    error?: string;
}
export interface GitResult {
    success: boolean;
    output: string;
    error?: string;
    branch?: string;
    commit?: string;
}
export declare const AGENT_TOOLS: ({
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
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
            timeout: {
                type: string;
                description: string;
            };
            path?: undefined;
            content?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            recursive: {
                type: string;
                description: string;
            };
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            pattern: {
                type: string;
                description: string;
            };
            file_pattern: {
                type: string;
                description: string;
            };
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            message: {
                type: string;
                description: string;
            };
            files: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            title?: undefined;
            body?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            title: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            thought?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            thought: {
                type: string;
                description: string;
            };
            path?: undefined;
            content?: undefined;
            command?: undefined;
            timeout?: undefined;
            recursive?: undefined;
            pattern?: undefined;
            file_pattern?: undefined;
            message?: undefined;
            files?: undefined;
            name?: undefined;
            title?: undefined;
            body?: undefined;
        };
        required: string[];
    };
})[];
export declare class AgentExecutor {
    private projectRoot;
    private maxOutputLength;
    private commandTimeout;
    constructor(projectRoot?: string);
    private isPathSafe;
    private isWritePathSafe;
    private isCommandSafe;
    private getFullPath;
    readFile(filePath: string): Promise<FileResult>;
    writeFile(filePath: string, content: string): Promise<FileResult>;
    runCommand(command: string, timeout?: number): Promise<ExecutionResult>;
    listFiles(dirPath?: string, recursive?: boolean): Promise<string[]>;
    private listFilesRecursive;
    searchCode(pattern: string, filePattern?: string): Promise<{
        file: string;
        line: number;
        content: string;
    }[]>;
    gitStatus(): Promise<GitResult>;
    gitCommit(message: string, files?: string[]): Promise<GitResult>;
    executeTool(toolName: string, args: any): Promise<any>;
}
export declare const agentExecutor: AgentExecutor;
//# sourceMappingURL=AgentExecutor.d.ts.map