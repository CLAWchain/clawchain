export const getBalance = async (address: string): Promise<string> => {
  // Call ClawChain API to get the balance for the given address
  const response = await fetch(`/api/balance/${address}`);
  const data = await response.json();
  return data.balance;
};

export const getTransactions = async (address: string): Promise<any[]> => {
  // Call ClawChain API to get the transaction history for the given address
  const response = await fetch(`/api/transactions/${address}`);
  const data = await response.json();
  return data.transactions;
};

export const getTokenBalances = async (address: string): Promise<any[]> => {
  // Call ClawChain API to get the token balances for the given address
  const response = await fetch(`/api/tokens/${address}`);
  const data = await response.json();
  return data.tokenBalances;
};