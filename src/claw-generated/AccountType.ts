import { AccountState } from '../blockchain/StateManager';

export interface AccountType extends AccountState {
  type: string;
  // Add any additional properties needed for custom account types
}