import express from 'express';
import { Blockchain } from './blockchain.js';
import { API } from './api.js';

const app = express();
const blockchain = new Blockchain();
const api = new API(blockchain);

app.get('/finality', (req, res) => {
  res.json(api.getFinalityStatus());
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});