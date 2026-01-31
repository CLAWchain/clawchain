import express, { Request, Response } from 'express';

const healthRouter = express.Router();

// Health check endpoint
healthRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Readiness check endpoint
healthRouter.get('/ready', (req: Request, res: Response) => {
  // Implement your readiness logic here
  // For example, check if the node is fully synced and ready to process transactions
  res.status(200).json({ status: 'ready' });
});

export default healthRouter;