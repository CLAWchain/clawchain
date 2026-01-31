import { ContractVM } from './contract_vm';
import { Account, ContractStorage, Transaction } from '../types';

describe('ContractVM', () => {
  let vm: ContractVM;
  let accounts: Account[];
  let storage: ContractStorage;

  beforeEach(() => {
    accounts = [
      { address: '0x1234', balance: 1000, isContract: false },
      { address: '0x5678', balance: 500, isContract: true, contract: { execute: jest.fn() } }
    ];
    storage = { get: jest.fn(), set: jest.fn() };
    vm = new ContractVM(accounts, storage);
  });

  it('should execute a CALL transaction', () => {
    const tx: Transaction = {
      from: '0x1234',
      to: '0x5678',
      opcode: 'CALL',
      gas: 100,
      params: ['0x5678', 'data', 50]
    };

    vm.executeContract(tx);

    expect(accounts[0].balance).toBe(900);
    expect(accounts[1].contract.execute).toHaveBeenCalledWith('data', 50);
    expect(accounts[0].balance).toBe(950);
  });

  it('should revert the caller\'s account on callee error', () => {
    const tx: Transaction = {
      from: '0x1234',
      to: '0x5678',
      opcode: 'CALL',
      gas: 100,
      params: ['0x5678', 'data', 50]
    };

    accounts[1].contract.execute = jest.fn(() => {
      throw new Error('Callee error');
    });

    expect(() => vm.executeContract(tx)).toThrowError('Callee error');
    expect(accounts[0].balance).toBe(1000);
  });
});