export interface Account {
  publicKey: string;
  lamports: number;
  owner: Uint8Array;
  executable: boolean;
}

export interface AccountInfo {
  lamports: number;
  owner: string;
  executable: boolean;
}