import express, { Request, Response } from 'express';
import { getBalance, sendTokens } from '../../../packages/core/src';
import rateLimit from 'express-rate-limit';
import { LRUCache } from 'lru-cache';
import { generateCaptcha, verifyCaptcha } from './captcha';

const app = express();
const port = process.env.PORT || 3000;

// IP-based rate limiter
const ipLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after 5 minutes'
});

// Address-based rate limiter
const addressCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 5 * 60 * 1000 // 5 minutes
});

app.use('/faucet', ipLimiter);

app.get('/faucet/:address', async (req: Request, res: Response) => {
  const address = req.params.address;
  const balance = await getBalance(address);
  
  if (balance > 0) {
    res.status(400).send('Address already has a balance');
    return;
  }

  // Check address-based rate limit
  const lastRequestTime = addressCache.get(address);
  if (lastRequestTime && Date.now() - lastRequestTime < 5 * 60 * 1000) {
    res.status(429).send('You have reached the faucet request limit. Please try again later.');
    return;
  }

  // Generate and send captcha
  const captcha = generateCaptcha();
  res.send(`Please solve the captcha: ${captcha.text}`);

  // Verify captcha solution
  const captchaSolution = req.query.captcha as string;
  if (!verifyCaptcha(captcha.text, captchaSolution)) {
    res.status(401).send('Incorrect captcha solution');
    return;
  }

  // Add address to cache
  addressCache.set(address, Date.now());

  await sendTokens(address, 1000);
  res.send('Faucet request successful');
});

app.listen(port, () => {
  console.log(`Faucet server running on port ${port}`);
});