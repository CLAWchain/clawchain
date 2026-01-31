import { VirtualMachine } from './vm';

describe('VirtualMachine', () => {
  it('should execute code with gas metering', () => {
    const vm = new VirtualMachine(100);
    const code = new Uint8Array([0x01, 0x02]); // ADD, SUB

    vm.execute(code);
    expect(vm.gas).toBe(6);
  });

  it('should halt execution when gas is depleted', () => {
    const vm = new VirtualMachine(5);
    const code = new Uint8Array([0x01, 0x01, 0x01, 0x01, 0x01, 0x01]); // 6 ADD instructions

    expect(() => vm.execute(code)).toThrowError('Out of gas');
  });
});