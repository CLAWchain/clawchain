import { getSignaturesForAddress } from './get_signatures_for_address';
import { ClawChainState } from '../state';

describe('getSignaturesForAddress', () => {
  it('should return signatures for an address', async () => {
    const state = new ClawChainState();
    state.addTransactionSignature('address1', 'sig1');
    state.addTransactionSignature('address1', 'sig2');
    state.addTransactionSignature('address2', 'sig3');

    const result = await getSignaturesForAddress({ address: 'address1' }, state);
    expect(result.signatures).toEqual(['sig1', 'sig2']);
    expect(result.before).toBeNull();
    expect(result.until).toBeNull();
  });

  it('should handle pagination', async () => {
    const state = new ClawChainState();
    for (let i = 0; i < 25; i++) {
      state.addTransactionSignature('address1', `sig${i}`);
    }

    let result = await getSignaturesForAddress({ address: 'address1', limit: 10 }, state);
    expect(result.signatures.length).toBe(10);
    expect(result.before).toBeNull();
    expect(result.until).toBe('sig9');

    result = await getSignaturesForAddress({ address: 'address1', limit: 10, until: result.until }, state);
    expect(result.signatures.length).toBe(10);
    expect(result.before).toBe('sig9');
    expect(result.until).toBe('sig0');
  });
});