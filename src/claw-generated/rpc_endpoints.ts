export const rpcEndpoints = {
  getBalance: {
    path: '/balance',
    method: 'GET',
    params: ['address']
  },
  sendTransaction: {
    path: '/tx',
    method: 'POST',
    params: ['from', 'to', 'value', 'data']
  },
  getTransactionReceipt: {
    path: '/tx/:txHash',
    method: 'GET',
    params: ['txHash']
  }
}