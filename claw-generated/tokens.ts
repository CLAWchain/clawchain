export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
  holderCount: number;
  recentTransfers: { from: string; to: string; amount: number }[];
}

export async function fetchTokens(): Promise<TokenInfo[]> {
  // TODO: Implement backend API call to fetch token data
  return [
    {
      address: '0x1234567890abcdef',
      name: 'Example Token',
      symbol: 'EXT',
      totalSupply: 1000000,
      holderCount: 500,
      recentTransfers: [
        { from: '0xabcd', to: '0xefgh', amount: 100 },
        { from: '0xijkl', to: '0xmnop', amount: 50 },
        { from: '0xqrst', to: '0xuvwx', amount: 25 },
      ],
    },
  ];
}