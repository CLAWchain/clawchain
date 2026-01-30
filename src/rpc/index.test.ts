import { JsonRpcServer } from './index';
import { VirtualMachine } from '../vm/virtual_machine';
import { AccountState } from '../state/account';

describe('JsonRpcServer', () => {
  let rpcServer: JsonRpcServer;
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
    rpcServer = new JsonRpcServer(vm);
  });

  describe('getBalance', () => {
    it('should return the correct balance for an account', () => {
      // Set up the account state
      const pubkey = 'abc123';
      const balance = 100000;
      const accountState = new AccountState(pubkey, balance);
      vm.setAccountState(pubkey, accountState);

      // Call the getBalance method
      const result = rpcServer.handleGetBalance({ pubkey });

      // Verify the result
      expect(result).toEqual(balance);
    });

    it('should return 0 for a non-existent account', () => {
      // Call the getBalance method for a non-existent account
      const result = rpcServer.handleGetBalance({ pubkey: 'non-existent' });

      // Verify the result
      expect(result).toEqual(0);
    });
  });
});