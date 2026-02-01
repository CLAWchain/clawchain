import { Account } from './Account';
import { ContractDeployer } from './ContractDeployer';
import { getContractAddress } from './utils';

describe('ContractDeployer', () => {
  it('should deploy a contract and return the correct address', async () => {
    const account = new Account('0x1234567890abcdef');
    const deployer = new ContractDeployer(account);
    const byteCode = '0x12345678';
    const contractAddress = await deployer.deployContract(byteCode);
    const expectedAddress = getContractAddress(account.address, 0);
    expect(contractAddress).toEqual(expectedAddress);
  });
});