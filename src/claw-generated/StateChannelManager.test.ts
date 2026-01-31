import { BigNumber, ethers } from 'ethers';
import { StateChannelManager, StateChannelParams } from './StateChannelManager';
import { StateChannel } from './StateChannel';

describe('StateChannelManager', () => {
  let manager: StateChannelManager;
  let mainChainContract: ethers.Contract;

  beforeEach(() => {
    // Mock the main chain contract
    mainChainContract = {
      deposit: jest.fn(),
      closeChannel: jest.fn(),
    } as unknown as ethers.Contract;

    manager = new StateChannelManager(mainChainContract);
  });

  it('should open and close a state channel', () => {
    const params: StateChannelParams = {
      channelId: '0x123',
      participant1: '0x456',
      participant2: '0x789',
      depositAmount: BigNumber.from(1000),
      initialState: { balance1: 500, balance2: 500 },
    };

    const channel = manager.openChannel(params);
    expect(channel).toBeInstanceOf(StateChannel);
    expect(channel.channelId).toBe(params.channelId);
    expect(mainChainContract.deposit).toHaveBeenCalledWith(
      params.channelId,
      params.participant1,
      params.participant2,
      params.depositAmount
    );

    channel.updateState({ balance1: 600, balance2: 400 });
    manager.closeChannel(params.channelId);
    expect(mainChainContract.closeChannel).toHaveBeenCalledWith(params.channelId);
  });
});