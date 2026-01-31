import { expect } from 'chai';
import { ethers } from 'ethers';
import { Governance, CLAW20 } from './Governance.sol';

describe('Governance', () => {
  let governance: Governance;
  let token: CLAW20;

  beforeEach(async () => {
    const [owner, user1, user2] = await ethers.getSigners();
    token = await new CLAW20__factory(owner).deploy();
    governance = await new Governance__factory(owner).deploy(token.address);
  });

  it('should create a new proposal', async () => {
    await governance.connect(owner).createProposal('Increase block time', 10000);
    const proposal = await governance.proposals(0);
    expect(proposal.description).to.equal('Increase block time');
    expect(proposal.startBlock).to.be.greaterThan(0);
    expect(proposal.endBlock).to.be.greaterThan(proposal.startBlock);
  });

  it('should allow users to vote on proposals', async () => {
    await governance.connect(owner).createProposal('Increase block time', 10000);
    await token.connect(owner).mint(owner.address, 1000 * 10 ** 18);
    await token.connect(owner).mint(user1.address, 500 * 10 ** 18);
    await token.connect(owner).mint(user2.address, 500 * 10 ** 18);

    await governance.connect(owner).vote(0, true);
    await governance.connect(user1).vote(0, false);
    await governance.connect(user2).vote(0, true);

    const proposal = await governance.proposals(0);
    expect(proposal.forVotes).to.equal(1500 * 10 ** 18);
    expect(proposal.againstVotes).to.equal(500 * 10 ** 18);
  });

  it('should execute successful proposals', async () => {
    await governance.connect(owner).createProposal('Increase block time', 10000);
    await token.connect(owner).mint(owner.address, 1000 * 10 ** 18);
    await token.connect(owner).mint(user1.address, 500 * 10 ** 18);

    await governance.connect(owner).vote(0, true);
    await governance.connect(user1).vote(0, true);

    // Fast forward to after the voting period
    await ethers.provider.send('evm_mine', [proposal.endBlock + 1]);

    await governance.connect(owner).executeProposal(0);
    const proposal = await governance.proposals(0);
    expect(proposal.executed).to.be.true;
  });
});