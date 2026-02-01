export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  amount: number;
  timestamp: number;
}

export interface RewardInfo {
  totalRewards: number;
  lastRewardTimestamp: number;
}