export class Proposal {
  id: number;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  voteStartAt: Date;
  voteEndAt: Date;
  approvalThreshold: number; // Percentage of total token supply required for approval
  votes: Vote[] = [];
}

export class Vote {
  voter: string;
  amount: number; // Voter's token balance
  choice: boolean; // true = approve, false = reject
}