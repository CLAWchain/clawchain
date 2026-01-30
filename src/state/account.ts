export class Account {
  pubkey: Uint8Array;
  lamports: number;
  owner: Uint8Array;
  executable: boolean;

  constructor(pubkey: Uint8Array, lamports: number, owner: Uint8Array, executable: boolean) {
    this.pubkey = pubkey;
    this.lamports = lamports;
    this.owner = owner;
    this.executable = executable;
  }
}