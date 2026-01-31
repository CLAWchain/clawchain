import { Request, Response, NextFunction } from 'express';

// In-memory cache to track request counts
const requestCounts: { [key: string]: number } = {};

// Sliding window size (in seconds)
const WINDOW_SIZE = 60;

// Max requests per window
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = `${req.ip}:${req.headers['x-api-key'] || 'no-key'}`;

  // Get the current count for this key
  const currentCount = requestCounts[key] || 0;

  // Increment the count
  requestCounts[key] = currentCount + 1;

  // Check if the limit has been exceeded
  if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.'
    });
    return;
  }

  // Schedule count reset after the window size
  setTimeout(() => {
    requestCounts[key] -= 1;
  }, WINDOW_SIZE * 1000);

  next();
};