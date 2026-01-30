import { MerklePatriciaTrie } from '../state/trie';
import { AccountState } from '../state/account_state';
import { Transaction } from '../transaction';

class VirtualMachine {
  private stack: any[] = [];
  private memory: Map<number, any> = new Map();
  private callStack: { stack: any[], memory: Map<number, any>, gas: number }[] = [];
  private trie: MerklePatriciaTrie;
  private accountState: AccountState;
  private gas: number;
  private gasLimit: number;

  constructor(trie: MerklePatriciaTrie, accountState: AccountState, gasLimit: number) {
    this.trie = trie;
    this.accountState = accountState;
    this.gasLimit = gasLimit;
    this.gas = gasLimit;
  }

  public executeTransaction(tx: Transaction): any {
    // Validate the transaction nonce
    const expectedNonce = this.accountState.getNonce(tx.from);
    if (tx.nonce !== expectedNonce) {
      throw new Error('Invalid transaction nonce');
    }

    // Update the account nonce
    this.accountState.setNonce(tx.from, expectedNonce + 1);

    // Check the gas limit
    if (tx.gasLimit > this.gasLimit) {
      throw new Error('Transaction gas limit exceeds VM limit');
    }

    // Execute the contract bytecode
    this.gas = tx.gasLimit;
    const result = this.execute(tx.data);

    // Check if the execution ran out of gas
    if (this.gas === 0) {
      throw new Error('Contract execution ran out of gas');
    }

    return result;
  }

  private execute(bytecode: Uint8Array): any {
    let pc = 0; // Program counter
    while (pc < bytecode.length) {
      const opcode = bytecode[pc];
      switch (opcode) {
        case 0x01: // PUSH
          this.push(bytecode[++pc]);
          this.decrementGas(1);
          pc++;
          break;
        case 0x02: // POP
          this.pop();
          this.decrementGas(1);
          break;
        case 0x03: // LOAD
          const address = this.pop();
          this.push(this.load(address));
          this.decrementGas(3);
          break;
        case 0x04: // STORE
          const value = this.pop();
          const storeAddress = this.pop();
          this.store(storeAddress, value);
          this.decrementGas(5);
          break;
        case 0x05: // JUMP
          const jumpAddress = this.pop();
          pc = jumpAddress;
          this.decrementGas(2);
          break;
        case 0x06: // CALL
          // Save the current execution context
          this.callStack.push({
            stack: [...this.stack],
            memory: new Map(this.memory),
            gas: this.gas
          });

          // Get the call parameters from the stack
          const gasLimit = this.pop();
          const targetAddress = this.pop();
          const argsLength = this.pop();
          const args = [];
          for (let i = 0; i < argsLength; i++) {
            args.push(this.pop());
          }

          // Execute the called contract
          this.gas = gasLimit;
          const callResult = this.executeContract(targetAddress, args);

          // Restore the original execution context
          const { stack, memory, gas } = this.callStack.pop()!;
          this.stack = stack;
          this.memory = memory;
          this.gas = gas;

          // Push the call result to the stack
          this.push(callResult);

          this.decrementGas(40);
          break;
        case 0x07: // RETURN
          // Return the top value from the stack
          return this.pop();
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
      pc++;
    }
    return this.stack[this.stack.length - 1];
  }

  private executeContract(address: number, args: any[]): any {
    // Load the contract code from the trie
    const contractCode = this.trie.get(address);
    if (!contractCode) {
      throw new Error(`Contract at address ${address} not found`);
    }

    // Create a new VM instance to execute the contract
    const childVM = new VirtualMachine(this.trie, this.accountState, this.gas);

    // Push the arguments to the child VM's stack
    for (const arg of args.reverse()) {
      childVM.push(arg);
    }

    // Execute the contract in the child VM
    const result = childVM.execute(contractCode);

    // Update the gas usage
    this.gas = childVM.gas;

    return result;
  }

  private push(value: any): void {
    this.stack.push(value);
  }

  private pop(): any {
    return this.stack.pop();
  }

  private load(address: number): any {
    return this.memory.get(address);
  }

  private store(address: number, value: any): void {
    this.memory.set(address, value);
  }

  private decrementGas(amount: number): void {
    this.gas -= amount;
    if (this.gas < 0) {
      throw new Error('Contract execution ran out of gas');
    }
  }
}

export { VirtualMachine };