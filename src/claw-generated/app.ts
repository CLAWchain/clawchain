import { Chain } from './chain';
import { Wallet } from './wallet';
import { FaucetService } from './faucet.service';
import { VirtualMachine } from './vm/vm';
import { JsonRpcServer, JsonRpcRequest, JsonRpcResponse } from './json-rpc';

const chain = new Chain();
const wallet = new Wallet();
const faucetService = new FaucetService();
const vm = new VirtualMachine();

const jsonRpcServer = new JsonRpcServer(chain, wallet, faucetService, vm);

// Start the JSON-RPC server
jsonRpcServer.start();

// Sample JSON-RPC request
const sampleRequest: JsonRpcRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'wallet_generateKeypair',
  params: [],
};

jsonRpcServer.handleRequest(sampleRequest)
  .then((response: JsonRpcResponse) => {
    console.log('JSON-RPC Response:', response);
  })
  .catch((error) => {
    console.error('JSON-RPC Error:', error);
  });