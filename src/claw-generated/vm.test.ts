import { VirtualMachine } from './vm';

describe('VirtualMachine', () => {
  it('should halt execution when gas limit is reached', () => {
    const vm = new VirtualMachine(10);
    const bytecode = new Uint8Array([0x01, 0x02, 0x01, 0x02]); // ADD, MUL, ADD, MUL

    expect(() => vm.execute(bytecode)).toThrowError('Out of gas');
  });
});