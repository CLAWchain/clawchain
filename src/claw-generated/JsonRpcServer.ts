import { IncomingMessage, ServerResponse } from 'http';

class JsonRpcServer {
  private methodHandlers: { [key: string]: (params: any) => any } = {};

  registerMethod(name: string, handler: (params: any) => any) {
    this.methodHandlers[name] = handler;
  }

  handleRequest(req: IncomingMessage, res: ServerResponse) {
    // Parse the JSON-RPC request
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const jsonRpcRequest = JSON.parse(body);
        // Dispatch the request to the appropriate method
        const jsonRpcResponse = this.handleJsonRpcRequest(jsonRpcRequest);
        // Send the response back to the client
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonRpcResponse));
      } catch (err) {
        // Handle errors
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON-RPC request' }));
      }
    });
  }

  handleJsonRpcRequest(request: any) {
    // Check if it's a batch request
    if (Array.isArray(request)) {
      // Handle batch requests
      const batchResponse = [];
      for (const singleRequest of request) {
        batchResponse.push(this.handleSingleJsonRpcRequest(singleRequest));
      }
      return batchResponse;
    } else {
      // Handle single request
      return this.handleSingleJsonRpcRequest(request);
    }
  }

  handleSingleJsonRpcRequest(request: any) {
    // Validate the request
    if (typeof request.jsonrpc !== 'string' || request.jsonrpc !== '2.0') {
      return this.createErrorResponse(-32600, 'Invalid Request');
    }

    if (typeof request.id !== 'string' && typeof request.id !== 'number' && request.id !== null) {
      return this.createErrorResponse(-32600, 'Invalid Request');
    }

    if (typeof request.method !== 'string') {
      return this.createErrorResponse(-32600, 'Invalid Request');
    }

    // Dispatch the request to the appropriate method
    try {
      const result = this.dispatchRequest(request.method, request.params);
      // Create the response
      return {
        jsonrpc: '2.0',
        result,
        id: request.id
      };
    } catch (err) {
      // Handle errors
      let code = -32603;
      let message = 'Internal error';
      if (err instanceof Error) {
        if (err.name === 'InvalidParamsError') {
          code = -32602;
          message = err.message;
        } else if (err.name === 'MethodNotFoundError') {
          code = -32601;
          message = err.message;
        }
      }
      return this.createErrorResponse(code, message);
    }
  }

  dispatchRequest(method: string, params: any) {
    // Implement method dispatching logic here
    const handler = this.methodHandlers[method];
    if (!handler) {
      throw new Error('MethodNotFoundError');
    }
    return handler(params);
  }

  createErrorResponse(code: number, message: string) {
    return {
      jsonrpc: '2.0',
      error: {
        code,
        message
      },
      id: null
    };
  }
}

export default JsonRpcServer;