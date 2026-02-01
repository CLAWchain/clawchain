import { Request, Response } from 'express';
import { IWallet } from '../wallet/wallet.interface';
import { walletService } from '../wallet/wallet.service';
import { rateLimit } from './rateLimit';
import { proofOfWork } from './proofOfWork';

export class FaucetController {
  async requestFunds(req: Request, res: Response) {
    const { address } = req.body;
    const ip = req.ip;

    // Check rate limit
    if (await rateLimit(ip, address)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    // Verify proof of work
    if (!(await proofOfWork(req))) {
      return res.status(403).json({ error: 'Proof of work required' });
    }

    const wallet: IWallet = await walletService.getWallet(address);
    if (!wallet) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Mint and send testnet funds to the wallet
    // TODO: Implement this logic
    return res.json({ message: 'Funds sent successfully' });
  }
}

export const faucetController = new FaucetController();