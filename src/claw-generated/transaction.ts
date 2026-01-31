import { Wallet } from './wallet';
import { MultiSig } from './multisig';

export class Transaction {
  private inputs: any[];
  private outputs: any[];
  private signatures: string[];

  constructor(inputs: any[], outputs: any[]) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.signatures = [];
  }

  addSignature(signature: string): void {
    this.signatures.push(signature);
  }

  verifySignatures(publicKeys: string[], requiredSignatures: number): boolean {
    const multiSig = new MultiSig(publicKeys, requiredSignatures);
    return multiSig.verifySignatures(this.signatures);
  }
}