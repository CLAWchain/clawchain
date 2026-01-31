import { VirtualMachine } from './index';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
  });

  it('should perform basic arithmetic operations', () => {
    vm.executeInstruction({ opcode: 0x01, operands: [2, 3] }); // ADD
    expect(vm.stack).toEqual([5]);

    vm.executeInstruction({ opcode: 0x02, operands: [4, 2] }); // SUB
    expect(vm.stack).toEqual([5, 2]);

    vm.executeInstruction({ opcode: 0x03, operands: [3, 4] }); // MUL
    expect(vm.stack).toEqual([5, 2, 12]);

    vm.executeInstruction({ opcode: 0x04, operands: [24, 3] }); // DIV
    expect(vm.stack).toEqual([5, 2, 8]);
  });

  it('should perform basic bitwise operations', () => {
    vm.executeInstruction({ opcode: 0x05, operands: [0b1010, 0b1100] }); // AND
    expect(vm.stack).toEqual([0b1000]);

    vm.executeInstruction({ opcode: 0x06, operands: [0b1010, 0b1100] }); // OR
    expect(vm.stack).toEqual([0b1010, 0b1100]);

    vm.executeInstruction({ opcode: 0x07, operands: [0b1010] }); // NOT
    expect(vm.stack).toEqual([0b1010, 0b1100, ~0b1010]);
  });
});