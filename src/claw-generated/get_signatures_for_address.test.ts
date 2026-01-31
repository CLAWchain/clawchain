import { mock, mockClear } from 'jest-mock-extended';
import { Connection, GetConfirmedSignaturesForAddressOptions, PublicKey } from '@solana/web3.js';
import { getSignaturesForAddress, GetSignaturesForAddressParams } from './get_signatures_for_address';

describe('getSignaturesForAddress', () => {
  const mockConnection = mock<Connection>();

  beforeEach(() => {
    mockClear(mockConnection);
  });

  it('should fetch signatures for an address', async () => {
    const address = 'example-address';
    const signatures = ['sig1', 'sig2', 'sig3'];
    mockConnection.getConfirmedSignaturesForAddress2.mockResolvedValue(
      signatures.map((sig) => ({ signature: sig }))
    );

    const params: GetSignaturesForAddressParams = { address };
    const result = await getSignaturesForAddress({ connection: mockConnection }, params);
    expect(result).toEqual(signatures);
    expect(mockConnection.getConfirmedSignaturesForAddress2).toHaveBeenCalledWith(
      new PublicKey(address),
      { limit: 20 }
    );
  });

  it('should apply pagination options', async () => {
    const address = 'example-address';
    const options = {
      limit: 10,
      before: 'sig-before',
      until: 'sig-until',
    };
    const signatures = ['sig1', 'sig2', 'sig3'];
    mockConnection.getConfirmedSignaturesForAddress2.mockResolvedValue(
      signatures.map((sig) => ({ signature: sig }))
    );

    const params: GetSignaturesForAddressParams = { address, options };
    const result = await getSignaturesForAddress({ connection: mockConnection }, params);
    expect(result).toEqual(signatures);
    expect(mockConnection.getConfirmedSignaturesForAddress2).toHaveBeenCalledWith(
      new PublicKey(address),
      options
    );
  });

  it('should handle errors', async () => {
    const address = 'example-address';
    const error = new Error('RPC error');
    mockConnection.getConfirmedSignaturesForAddress2.mockRejectedValue(error);

    const params: GetSignaturesForAddressParams = { address };
    await expect(getSignaturesForAddress({ connection: mockConnection }, params)).rejects.toThrow(error);
  });
});