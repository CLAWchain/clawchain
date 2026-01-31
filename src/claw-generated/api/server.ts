import express, { Express } from 'express';
import routes from './routes';

const app: Express = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

export default app;