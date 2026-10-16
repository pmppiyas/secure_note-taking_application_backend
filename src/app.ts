import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import routes from './routes/routes';
import connectDB from './config/db';
import config from './config';
import AppError from './utils/AppError';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middlewares/error.middleware';

const app: Application = express();

const allowedOrigins = config.allowedOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes('*') ||
      allowedOrigins.some(
        (allowed) => allowed.toLowerCase() === origin.toLowerCase()
      );

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(
      new AppError(
        `Blocked by CORS: Origin ${origin} is not allowed by FRONTEND_URL env`,
        403
      )
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  optionsSuccessStatus: 204,
};

// Global Middlewares
app.use(cors(corsOptions));
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
