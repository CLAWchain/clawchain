import { BigNumber } from 'bignumber.js';
import { Account } from '../account';
import { Block } from '../block';
import { Transaction } from '../transaction';

export class Stake {
  owner: Account;
  amount: BigNumber;
  startBlock: Block;
  endBlock: Block;
  rewardRate: BigNumber;

  constructor(owner: Account, amount: BigNumber, startBlock: Block, endBlock: Block, rewardRate: BigNumber) {
    this.owner = owner;
    this.amount = amount;
    this.startBlock = startBlock;
    this.endBlock = endBlock;
    this.rewardRate = rewardRate;
  }

  calculateReward(currentBlock: Block): BigNumber {
    const elapsedBlocks = currentBlock.number - this.startBlock.number;
    const totalReward = this.amount.multipliedBy(this.rewardRate).multipliedBy(elapsedBlocks);
    return totalReward;
  }
}