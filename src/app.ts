import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes/routes';
import connectDB from './config/db';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middlewares/error.middleware';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for serverless and persistent invocations
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root health-check route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Secure Note-Taking API is running',
  });
});

// Mount main API router
app.use('/api/v1', routes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Central Global Error Handler
app.use(globalErrorHandler);

export default app;
