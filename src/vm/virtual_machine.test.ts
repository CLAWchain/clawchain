import { VirtualMachine } from './virtual_machine';
import { MerklePatriciaTrie } from '../state/trie';
import { AccountState } from '../state/account_state';

describe('VirtualMachine', () => {
  it('should execute simple contract bytecode', () => {
    const trie = new MerklePatriciaTrie();
    const vm = new VirtualMachine(trie, new AccountState(), 1000000);

    const bytecode = new Uint8Array([
      0x01, 0x05, // PUSH 5
      0x01, 0x03, // PUSH 3
      0x02, // POP
      0x03, // LOAD
      0x07, // RETURN
    ]);

    const result = vm.execute(bytecode);
    expect(result).toEqual(3);
  });

  it('should execute contract-to-contract call', () => {
    const trie = new MerklePatriciaTrie();
    const accountState = new AccountState();
    const vm = new VirtualMachine(trie, accountState, 1000000);

    // Deploy a "caller" contract
    const callerBytecode = new Uint8Array([
      0x01, 0x20, // PUSH 32 (gas limit)
      0x01, 0x1234, // PUSH 0x1234 (target address)
      0x01, 0x01, // PUSH 1 (argument count)
      0x01, 0x05, // PUSH 5 (argument)
      0x06, // CALL
      0x07, // RETURN
    ]);
    const callerAddress = 0x1000;
    trie.set(callerAddress, callerBytecode);

    // Deploy a "callee" contract
    const calleeBytecode = new Uint8Array([
      0x03, // LOAD
      0x01, 0x03, // PUSH 3
      0x02, // POP
      0x07, // RETURN
    ]);
    const calleeAddress = 0x1234;
    trie.set(calleeAddress, calleeBytecode);

    // Execute the "caller" contract
    const result = vm.executeTransaction({
      from: 0x0,
      to: callerAddress,
      data: callerBytecode,
      nonce: 0,
      gasLimit: 1000000,
    });

    expect(result).toEqual(3);
  });
});