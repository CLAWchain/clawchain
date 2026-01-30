import { ContractStorage } from './contract_storage';
import { Transaction } from './transaction';

export class VirtualMachine {
  private contractStorage: ContractStorage;

  constructor(contractStorage: ContractStorage) {
    this.contractStorage = contractStorage;
  }

  async executeContract(tx: Transaction): Promise<any> {
    // Load contract code from storage
    const contractCode = await this.contractStorage.getContractCode(tx.to);

    // Validate transaction
    // ...

    // Execute contract instructions
    let result;
    for (const instruction of contractCode) {
      if (instruction === 'CALL') {
        // Handle CALL opcode
        const targetAddress = contractCode[++i];
        const gasLimit = contractCode[++i];
        const valueToSend = contractCode[++i];
        const argsLength = contractCode[++i];
        const args = contractCode.slice(i + 1, i + 1 + argsLength);
        i += argsLength;

        // Load target contract code
        const targetContractCode = await this.contractStorage.getContractCode(targetAddress);

        // Execute target contract, forwarding gas and value
        const targetResult = await this.executeContract(new Transaction({
          to: targetAddress,
          value: valueToSend,
          gas: gasLimit,
          data: args
        }));

        // Handle target contract result
        result = targetResult;
      } else {
        // Execute other instructions
        // ...
      }
    }

    // Return contract result
    return result;
  }
}