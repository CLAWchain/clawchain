import { GAS_COSTS } from './gas-costs';

export class VirtualMachine {
  private gasLimit: number;
  private gasUsed: number;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  execute(bytecode: Uint8Array): any {
    let pc = 0;
    while (pc < bytecode.length) {
      const opcode = bytecode[pc];
      this.gasUsed += GAS_COSTS[OpCodes[opcode]];
      if (this.gasUsed > this.gasLimit) {
        throw new Error('Execution halted due to gas limit reached');
      }
      // Execute the opcode
      pc += 1;
    }
    return null;
  }

  getGasUsed(): number {
    return this.gasUsed;
  }
}

enum OpCodes {
  PUSH = 0x60,
  ADD = 0x01,
  MUL = 0x02,
  SUB = 0x03,
  DIV = 0x04,
  MOD = 0x06,
  EXP = 0x0a,
  LT = 0x10,
  GT = 0x11,
  EQ = 0x14,
  ISZERO = 0x15,
  AND = 0x16,
  OR = 0x17,
  XOR = 0x18,
  NOT = 0x19,
  BYTE = 0x1a,
  CALLDATALOAD = 0x35,
  CALLDATASIZE = 0x36,
  CALLDATACOPY = 0x37,
  CODESIZE = 0x38,
  CODECOPY = 0x39,
  GASPRICE = 0x3a,
  EXTCODESIZE = 0x3b,
  EXTCODECOPY = 0x3c,
  BALANCE = 0x31,
  CALL = 0xf1,
  CALLCODE = 0xf2,
  RETURN = 0xf3,
  REVERT = 0xfd,
  SELFDESTRUCT = 0xff
}