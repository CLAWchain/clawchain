import express from 'express';
import { validateTransaction } from './transactions';

const app = express();

app.use(express.json());

app.post('/transactions', validateTransaction);

app.listen(3000, () => {
  console.log('API server started on port 3000');
});