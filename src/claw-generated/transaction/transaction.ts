export class Transaction {
  constructor(
    public readonly hash: string,
    public readonly from: string,
    public readonly to: string,
    public readonly amount: number,
    public readonly status: 'pending' | 'success' | 'failed'
  ) {}
}