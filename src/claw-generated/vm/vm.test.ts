import { VirtualMachine } from './index';

describe('VirtualMachine', () => {
  it('should execute bytecode and track gas usage', () => {
    const vm = new VirtualMachine(100);
    const bytecode = new Uint8Array([
      0x60, 0x05, // PUSH 5
      0x60, 0x03, // PUSH 3
      0x01 // ADD
    ]);

    vm.execute(bytecode);
    expect(vm.getGasUsed()).toBe(11);
  });

  it('should halt execution when gas limit is reached', () => {
    const vm = new VirtualMachine(10);
    const bytecode = new Uint8Array([
      0x60, 0x05, // PUSH 5
      0x60, 0x03, // PUSH 3
      0x01, // ADD
      0x01, // ADD
      0x01 // ADD
    ]);

    expect(() => vm.execute(bytecode)).toThrowError('Execution halted due to gas limit reached');
  });
});