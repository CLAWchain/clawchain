import { Wallet, Transaction } from '../wallet';

export class StateChannel {
  participants: [Wallet, Wallet];
  depositAmount: number;
  currentState: any;

  constructor(participants: [Wallet, Wallet], depositAmount: number) {
    this.participants = participants;
    this.depositAmount = depositAmount;
    this.currentState = {};
  }

  updateState(newState: any) {
    this.currentState = newState;
  }

  closeChannel(): Transaction {
    // Settle final state on-chain
    return this.participants[0].signTransaction(/* transaction details */);
  }
}