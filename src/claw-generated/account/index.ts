// src/claw-generated/account/index.ts

export interface Account {
  address: string;
  validate(tx: Transaction): boolean;
}

export class SimpleAccount implements Account {
  address: string;

  constructor(address: string) {
    this.address = address;
  }

  validate(tx: Transaction): boolean {
    return tx.from === this.address;
  }
}