export async function rpcCall(method: string, params: any[]): Promise&lt;any&gt; {
  // Implement RPC call logic here
  if (method === 'getBalance') {
    return { result: '100' };
  } else {
    throw new Error('Invalid method');
  }
}