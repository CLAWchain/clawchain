// claw-generated/rpc-types.ts
export type RPCRequest = {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any[];
};

export type RPCResponse = {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

export type RPCMethod = (params: any[]) => Promise<any>;