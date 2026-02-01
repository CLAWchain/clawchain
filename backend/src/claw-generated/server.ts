import express, { Express } from 'express';
import { faucetRouter } from './faucet';

const app: Express = express();

app.use(express.json());

app.use('/api/faucet', faucetRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});