import express from 'express';
import { getAccountInfo } from './rpc/account';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/rpc/getAccountInfo', getAccountInfo);

app.listen(port, () => {
  console.log(`ClawChain RPC server running on port ${port}`);
});