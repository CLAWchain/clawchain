import { Account, Transaction } from '../core';
import { RateLimiter } from './rate-limiter';
import { CaptchaChallenge } from './captcha-challenge';

export class Faucet {
  private accounts: Account[];
  private transactions: Transaction[];
  private rateLimiter: RateLimiter;
  private captchaChallenge: CaptchaChallenge;

  constructor(accounts: Account[], transactions: Transaction[]) {
    this.accounts = accounts;
    this.transactions = transactions;
    this.rateLimiter = new RateLimiter();
    this.captchaChallenge = new CaptchaChallenge();
  }

  async dispenseTokens(address: string, amount: number, ip: string): Promise<Transaction> {
    // Check rate limit
    if (!this.rateLimiter.canRequest(address, ip)) {
      throw new Error('Rate limit exceeded');
    }

    // Verify captcha
    if (!await this.captchaChallenge.verify(ip)) {
      throw new Error('Captcha verification failed');
    }

    // Find the faucet account
    const faucetAccount = this.accounts.find(a => a.isFaucet());
    if (!faucetAccount) {
      throw new Error('No faucet account found');
    }

    // Create a new transaction to transfer tokens
    const tx = new Transaction({
      from: faucetAccount.publicKey,
      to: address,
      amount
    });

    // Sign and execute the transaction
    await tx.sign(faucetAccount.privateKey);
    await this.transactions.add(tx);

    // Update rate limiter
    this.rateLimiter.recordRequest(address, ip);

    return tx;
  }
}