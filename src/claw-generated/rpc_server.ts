import { getSignaturesForAddress } from './get_signatures_for_address';
import { ClawChainState } from '../state';

export function createRpcServer(state: ClawChainState) {
  return {
    // Existing RPC methods...
    getSignaturesForAddress: (params: any) => getSignaturesForAddress(params, state)
  };
}