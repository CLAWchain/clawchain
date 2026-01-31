import express from 'express';
import contractVerificationRouter from './contractVerification';

const app = express();
app.use(express.json());

app.use('/api', contractVerificationRouter);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});