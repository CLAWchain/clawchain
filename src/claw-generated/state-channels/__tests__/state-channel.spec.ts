import { Wallet } from '../../wallet';
import { StateChannel } from '../state-channel';
import { StateChannelManager } from '../state-channel-manager';

describe('StateChannel', () => {
  it('should create a new state channel', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const channel = new StateChannel([wallet1, wallet2], 1000);
    expect(channel.participants).toEqual([wallet1, wallet2]);
    expect(channel.depositAmount).toEqual(1000);
  });

  it('should update the state of the channel', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const channel = new StateChannel([wallet1, wallet2], 1000);
    channel.updateState({ balance1: 500, balance2: 500 });
    expect(channel.currentState).toEqual({ balance1: 500, balance2: 500 });
  });

  it('should close the channel and return a transaction', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const channel = new StateChannel([wallet1, wallet2], 1000);
    const tx = channel.closeChannel();
    expect(tx).toBeDefined();
  });
});

describe('StateChannelManager', () => {
  it('should open a new state channel', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const manager = new StateChannelManager();
    const channel = manager.openChannel(wallet1, wallet2, 1000);
    expect(channel.participants).toEqual([wallet1, wallet2]);
    expect(channel.depositAmount).toEqual(1000);
  });

  it('should get an existing state channel', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const manager = new StateChannelManager();
    const channel = manager.openChannel(wallet1, wallet2, 1000);
    const foundChannel = manager.getChannel([wallet1, wallet2]);
    expect(foundChannel).toEqual(channel);
  });

  it('should close an existing state channel', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const manager = new StateChannelManager();
    const channel = manager.openChannel(wallet1, wallet2, 1000);
    const tx = manager.closeChannel(channel);
    expect(tx).toBeDefined();
  });
});