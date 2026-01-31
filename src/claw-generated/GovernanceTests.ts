import { expect } from 'chai';
import { ethers } from 'ethers';
import { Governance, CRCTOKEN, StakingStateManager } from './claw-generated';

describe('Governance', () => {
  let governance: Governance;
  let token: CRCTOKEN;
  let staking: StakingStateManager;

  beforeEach(async () => {
    token = await deployMockToken();
    staking = await deployMockStakingManager();
    governance = await deployGovernance(token, staking);
  });

  it('should allow creating a proposal', async () => {
    await token.transfer(ethers.Wallet.createRandom().address, 10000 * 10**18);
    await governance.proposeChange('Increase block size', 'Increase the block size to 2MB', 20, 50);
    const proposal = await governance.proposals(1);
    expect(proposal.title).to.equal('Increase block size');
    expect(proposal.description).to.equal('Increase the block size to 2MB');
    expect(proposal.startBlock).to.equal(await ethers.provider.getBlockNumber());
    expect(proposal.endBlock).to.equal(await ethers.provider.getBlockNumber() + 20);
    expect(proposal.quorum).to.equal(50);
  });

  it('should not allow creating a proposal without enough tokens', async () => {
    await expect(governance.proposeChange('Increase block size', 'Increase the block size to 2MB', 20, 50)).to.be.revertedWith('Minimum 10,000 CRC tokens required to propose');
  });

  it('should allow casting votes', async () => {
    await token.transfer(ethers.Wallet.createRandom().address, 10000 * 10**18);
    await governance.proposeChange('Increase block size', 'Increase the block size to 2MB', 20, 50);
    await staking.setStakedBalance(ethers.Wallet.createRandom().address, 1000);
    await governance.castVote(1, true);
    const proposal = await governance.proposals(1);
    expect(proposal.forVotes).to.equal(1000);
    expect(proposal.voted[ethers.Wallet.createRandom().address]).to.be.true;
  });

  it('should execute a proposal if quorum is met', async () => {
    await token.transfer(ethers.Wallet.createRandom().address, 10000 * 10**18);
    await governance.proposeChange('Increase block size', 'Increase the block size to 2MB', 20, 50);
    await staking.setStakedBalance(ethers.Wallet.createRandom().address, 1000);
    await governance.castVote(1, true);
    await ethers.provider.send('evm_mine', [await ethers.provider.getBlockNumber() + 20]);
    await governance.executeProposal(1);
    const proposal = await governance.proposals(1);
    expect(proposal.executed).to.be.true;
  });

  async function deployMockToken(): Promise<CRCTOKEN> {
    const token = new ethers.ContractFactory(CRCTOKEN.abi, CRCTOKEN.bytecode, ethers.provider.getSigner()).deploy(await deployMockStakingManager());
    return token as CRCTOKEN;
  }

  async function deployMockStakingManager(): Promise<StakingStateManager> {
    return {
      getStakedBalance: async (address: string) => 0
    } as StakingStateManager;
  }

  async function deployGovernance(token: CRCTOKEN, staking: StakingStateManager): Promise<Governance> {
    return new Governance(token, staking);
  }
});