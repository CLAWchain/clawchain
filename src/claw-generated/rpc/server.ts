import express from 'express';
import { getSignaturesForAddress } from './methods';

const app = express();
app.use(express.json());

app.get('/signatures', getSignaturesForAddress);

app.listen(8080, () => {
  console.log('RPC server started on port 8080');
});