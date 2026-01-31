import { VirtualMachine } from './vm';
import { Contract } from './contract';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;
  let caller: Contract;
  let callee: Contract;

  beforeEach(() => {
    vm = new VirtualMachine();
    caller = new Contract(vm);
    callee = new Contract(vm);
  });

  it('should execute a contract-to-contract call', async () => {
    // Set up the callee contract to return a known value
    callee.execute = jest.fn().mockReturnValue(new Uint8Array([0x42]));

    // Call the callee contract from the caller contract
    const result = await caller.call('0x1234', new Uint8Array([0x01, 0x02]), 1000);

    // Verify the call was executed correctly
    expect(callee.execute).toHaveBeenCalledWith(new Uint8Array([0x01, 0x02]), 1000);
    expect(result).toEqual(new Uint8Array([0x42]));
    expect(vm.getGasUsed()).toBeGreaterThan(0);
  });
});