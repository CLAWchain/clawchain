import { GetSignaturesForAddressParams, GetSignaturesForAddressResult } from './rpc_types';
import { ClawChainState } from '../state';

export async function getSignaturesForAddress(
  params: GetSignaturesForAddressParams,
  state: ClawChainState
): Promise&lt;GetSignaturesForAddressResult&gt; {
  const { address, limit = 20, before, until } = params;
  
  // Fetch signatures for the given address from the state
  const signatures = await state.getSignaturesForAddress(address, { limit, before, until });

  // Prepare the response
  const result: GetSignaturesForAddressResult = {
    signatures,
    before: null,
    until: null
  };

  // Set pagination cursors if applicable
  if (signatures.length === limit) {
    result.until = signatures[signatures.length - 1];
  }
  if (before && signatures.length > 0) {
    result.before = signatures[0];
  }

  return result;
}