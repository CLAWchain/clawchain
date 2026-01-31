import { BigNumber, utils } from 'ethers';

interface StateChannelParams {
  channelId: string;
  participant1: string;
  participant2: string;
  depositAmount: BigNumber;
  initialState: any;
}

class StateChannel {
  channelId: string;
  participant1: string;
  participant2: string;
  depositAmount: BigNumber;
  state: any;

  constructor(params: StateChannelParams) {
    this.channelId = params.channelId;
    this.participant1 = params.participant1;
    this.participant2 = params.participant2;
    this.depositAmount = params.depositAmount;
    this.state = params.initialState;
  }

  updateState(newState: any): void {
    // Verify the new state is valid
    // Sign the new state with both participants' private keys
    // Store the signed state update

    this.state = newState;
  }

  closeChannel(): void {
    // Verify the final state is valid
    // Withdraw the deposited funds to the participants
    // Notify the main chain of the channel closure
  }
}

export { StateChannel, StateChannelParams };