import express from 'express';
import apiRouter from './api';

const app = express();

app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('ClawChain API server started on port 3000');
});