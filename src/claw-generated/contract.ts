export class Contract {
  address: string;
  code: Uint8Array;
  storage: Map<string, Uint8Array>;

  constructor(address: string, code: Uint8Array) {
    this.address = address;
    this.code = code;
    this.storage = new Map();
  }

  execute(input: Uint8Array, gas: number): [Uint8Array, number] {
    // TODO: Implement contract execution logic
    let programCounter = 0;
    let result = new Uint8Array();
    
    while (programCounter < this.code.length && gas > 0) {
      const opcode = this.code[programCounter];
      programCounter++;

      switch (opcode) {
        case 0x00: // STOP
          return [result, gas];
        case 0x01: // ADD
          // TODO: Implement ADD opcode
          break;
        case 0x02: // CALL
          // Get the target address
          const targetAddress = this.getAddress(programCounter);
          programCounter += 20;

          // Get the input data size
          const inputSize = this.getUint32(programCounter);
          programCounter += 4;

          // Get the input data
          const inputData = new Uint8Array(this.code.buffer, programCounter, inputSize);
          programCounter += inputSize;

          // Get the gas limit
          const gasLimit = this.getUint64(programCounter);
          programCounter += 8;

          // Call the target contract
          const [callResult, remainingGas] = this.call(targetAddress, inputData, gasLimit);
          result = callResult;
          gas = remainingGas;
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }

    return [result, gas];
  }

  call(targetAddress: string, input: Uint8Array, gas: number): [Uint8Array, number] {
    // Get the target contract
    const targetContract = new Contract(targetAddress, new Uint8Array());
    
    // Execute the call on the target contract
    const [result, remainingGas] = targetContract.execute(input, gas);

    // Return the result and remaining gas
    return [result, remainingGas];
  }

  private getAddress(offset: number): string {
    const addressBytes = new Uint8Array(this.code.buffer, offset, 20);
    return '0x' + Array.from(addressBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getUint32(offset: number): number {
    const bytes = new Uint8Array(this.code.buffer, offset, 4);
    return new DataView(bytes.buffer).getUint32(0, false);
  }

  private getUint64(offset: number): number {
    const bytes = new Uint8Array(this.code.buffer, offset, 8);
    return new DataView(bytes.buffer).getBigUint64(0, false);
  }
}