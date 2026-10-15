import { Server } from 'http';
import app from './app';
import config from './config';
import connectDB from './config/db';

let server: Server;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

async function bootstrap(): Promise<void> {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      console.log(
        `Server is running on port ${config.port} in ${config.nodeEnv}`
      );
    });
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

bootstrap();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION! Shutting down...', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Gracefully shutting down...');
  if (server) {
    server.close(() => {
      console.log('Process terminated');
    });
  }
});
