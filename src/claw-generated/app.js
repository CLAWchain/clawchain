import express from 'express';
import apiRoutes from './api-routes';

const app = express();

// Mount API routes
app.use('/api', apiRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});