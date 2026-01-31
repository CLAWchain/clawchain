export type Instruction = {
  opcode: number;
  operands: any[];
};

export type OperationHandler = (vm: VirtualMachine, operands: any[]) => void;