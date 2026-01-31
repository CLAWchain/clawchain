import { ContractVM, Instruction } from './index';

describe('VirtualMachine', () => {
  it('should execute basic instructions', () => {
    const vm = new ContractVM();
    const instructions: Instruction[] = [
      { opcode: 'PUSH', params: [5] },
      { opcode: 'PUSH', params: [3] },
      { opcode: 'ADD' },
      { opcode: 'PUSH', params: [2] },
      { opcode: 'MUL' },
    ];

    vm.execute(instructions);
    expect(vm.stack).toEqual([16]);
  });

  it('should throw on unknown opcode', () => {
    const vm = new ContractVM();
    const instructions: Instruction[] = [
      { opcode: 'PUSH', params: [5] },
      { opcode: 'UNKNOWN' },
    ];

    expect(() => vm.execute(instructions)).toThrowError('Unknown opcode: UNKNOWN');
  });
});