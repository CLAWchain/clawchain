export interface AccountState {
  address: string;
  balance: bigint;
  nonce: number;
  codeHash?: string;
  storageRoot?: string;
  storage: Map<string, string>;
}