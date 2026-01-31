import { getChainConfig } from '../config/config';

export function initChain() {
  const config = getChainConfig();
  // Initialize chain using the genesis configuration
  console.log('Initializing chain with genesis config:', config.genesis);
}