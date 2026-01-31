import { expect } from 'chai';
import { getSignaturesForAddress } from '../rpc';
import { Connection } from '@solana/web3.js';

describe('RPC Methods', () => {
  it('getSignaturesForAddress', async () => {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const signatures = await getSignaturesForAddress(connection, 'your-address-here', 5);
    expect(signatures).to.be.an('array');
    expect(signatures.length).to.be.at.least(1);
  });
});