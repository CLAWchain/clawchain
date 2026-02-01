import express from 'express';
import routes from './routes';

const app = express();

// Use the rate limiting middleware
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});