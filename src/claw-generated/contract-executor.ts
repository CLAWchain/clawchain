import { Account } from './account';

export class ContractExecutor {
  public execute(account: Account, input: any): any {
    // Read from account storage slots
    const value = account.getStorageSlot('someKey');

    // Modify state
    const result = doSomeLogic(value, input);

    // Write to account storage slots
    account.setStorageSlot('someKey', result);

    return result;
  }

  private doSomeLogic(value: any, input: any): any {
    // Implement contract execution logic here
    return value + input;
  }
}