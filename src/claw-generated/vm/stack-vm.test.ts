import { Instruction, StackVM } from './index';

describe('StackVM', () => {
  it('should execute basic arithmetic operations', () => {
    const vm = new StackVM();
    const bytecode = [
      Instruction.PUSH, 5,
      Instruction.PUSH, 3,
      Instruction.ADD,
      Instruction.PUSH, 2,
      Instruction.MUL,
      Instruction.STOP
    ];
    vm.execute(bytecode);
    expect(vm.stack).toEqual([16]);
  });

  it('should execute conditional jumps', () => {
    const vm = new StackVM();
    const bytecode = [
      Instruction.PUSH, 1,
      Instruction.PUSH, 0,
      Instruction.JUMPI, 5,
      Instruction.PUSH, 100,
      Instruction.STOP,
      Instruction.PUSH, 200,
      Instruction.STOP
    ];
    vm.execute(bytecode);
    expect(vm.stack).toEqual([200]);
  });
});