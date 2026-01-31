import { ClawChainNode } from '../node/clawchain-node';
import { ClawChainWallet } from '../wallet/clawchain-wallet';
import { StateChannelAPI } from './state-channel-api';
import { BigNumber } from 'ethers';

class StateChannelIntegration {
  private node: ClawChainNode;
  private wallet: ClawChainWallet;
  private channelAPI: StateChannelAPI;

  constructor(node: ClawChainNode, wallet: ClawChainWallet) {
    this.node = node;
    this.wallet = wallet;
    this.channelAPI = new StateChannelAPI();
  }

  createChannel(participants: string[], initialBalance: BigNumber): StateChannel {
    const channel = this.channelAPI.createChannel(participants, initialBalance);
    this.node.registerStateChannel(channel);
    return channel;
  }

  closeChannel(channelId: string): void {
    this.channelAPI.closeChannel(channelId);
    this.node.settleStateChannel(channelId);
  }

  updateChannelBalance(channelId: string, newBalance: BigNumber): void {
    this.channelAPI.updateChannelBalance(channelId, newBalance);
    // Trigger on-chain settlement if necessary
  }
}

export { StateChannelIntegration };