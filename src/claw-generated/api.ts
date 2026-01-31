const express = require('express');
const { BlockChain } = require('./chain');

const app = express();
const blockchain = new BlockChain();

app.get('/block/:hash', (req, res) => {
  const { hash } = req.params;
  const { finalized, confirmations } = blockchain.getBlockStatus(hash);
  res.json({ finalized, confirmations });
});

app.listen(3000, () => {
  console.log('API server started on port 3000');
});