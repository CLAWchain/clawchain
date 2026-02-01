export interface ExecutionContext {
  getTargetAddress(): string;
  getContract(address: string): Contract | null;
  getCalldata(): Uint8Array;
  getGas(): number;
  getSender(): string;
  getValue(): number;
  setReturnValue(value: Uint8Array): void;
  setGasRefund(gas: number): void;
  getReturnValue(): Uint8Array;
  getGasRefund(): number;
  setParentContext(context: ExecutionContext): void;
}

export interface Contract {
  code: Uint8Array;
  execute(context: ExecutionContext): void;
}