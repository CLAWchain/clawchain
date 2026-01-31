import { PublicKey, Signature, verifySignature } from './crypto';
import { Transaction } from './transaction';

interface StateChannelUpdate {
  channelId: string;
  state: any;
  signatures: Signature[];
}

class StateChannel {
  id: string;
  participants: PublicKey[];
  state: any;
  pendingUpdates: StateChannelUpdate[];

  constructor(id: string, participants: PublicKey[]) {
    this.id = id;
    this.participants = participants;
    this.state = {};
    this.pendingUpdates = [];
  }

  applyUpdate(update: StateChannelUpdate): boolean {
    // Verify signatures from all participants
    for (const signature of update.signatures) {
      if (!this.participants.every(participant => verifySignature(signature, update, participant))) {
        return false;
      }
    }

    // Apply the state update
    this.state = update.state;
    this.pendingUpdates.push(update);
    return true;
  }

  closeChannel(): Transaction {
    // Create a transaction to settle the final channel state on-chain
    return {
      from: this.participants[0],
      to: this.participants[1],
      value: this.state.balance,
      nonce: 0,
      signatures: []
    };
  }
}

export { StateChannel, StateChannelUpdate };