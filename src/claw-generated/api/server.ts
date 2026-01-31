import express, { Express } from 'express';
import routes from './routes';
import { Chain } from '../blockchain/Chain';
import { TransactionPool } from '../blockchain/TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { initializeHealthChecks } from './health';

const app: Express = express();

// Middleware
app.use(express.json());

// Health and readiness checks
const chain = new Chain();
const txPool = new TransactionPool();
const validatorManager = new ValidatorManager();
initializeHealthChecks(app, chain, txPool, validatorManager);

// Routes
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

export default app;