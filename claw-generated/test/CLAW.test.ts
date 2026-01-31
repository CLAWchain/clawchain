import { expect } from 'chai';
import { ethers } from 'ethers';
import { CLAW } from '../CLAW';

describe('CLAW Token', () => {
  let claw: CLAW;
  let owner: ethers.Wallet;
  let recipient: ethers.Wallet;

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    claw = await new CLAW('CLAW Token', 'CLAW', 18).deploy();
  });

  it('should have the correct metadata', async () => {
    expect(await claw.name()).to.equal('CLAW Token');
    expect(await claw.symbol()).to.equal('CLAW');
    expect(await claw.decimals()).to.equal(18);
  });

  // Add more tests here
});