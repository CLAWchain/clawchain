import { walletRouter } from './wallet';
import { faucetRoute } from './faucet';

export const clawGeneratedRoutes = [
  { path: '/api/wallet', router: walletRouter },
  { path: '/api/wallet/faucet', handler: faucetRoute }
];