import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/AppError';

export interface IErrorSource {
  path: string | number;
  message: string;
}

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorSources: IErrorSource[] = [];

  // Zod Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: String(issue.path[issue.path.length - 1] ?? ''),
      message: issue.message,
    }));
  }
  // Mongoose CastError (Invalid ObjectId)
  else if (
    err.name === 'CastError' ||
    err instanceof mongoose.Error.CastError
  ) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errorSources = [
      {
        path: err.path,
        message: `Invalid ${err.path}: ${err.value}`,
      },
    ];
  }
  // Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    const match = err.message ? err.message.match(/(["'])(\\?.)*?\1/) : null;
    const value = match ? match[0] : '';
    const field =
      Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    message = `Duplicate field value: ${value || field}. Please use another value!`;
    errorSources = [
      {
        path: field,
        message: `${field} must be unique`,
      },
    ];
  }
  // Mongoose ValidationError
  else if (
    err.name === 'ValidationError' ||
    err instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;
    message = 'Validation Error';
    const errors = err.errors
      ? (Object.values(err.errors) as mongoose.Error.ValidatorError[])
      : [];
    errorSources = errors.map((val) => ({
      path: val.path,
      message: val.message,
    }));
  }
  // JWT Errors
  else if (
    err instanceof jwt.JsonWebTokenError ||
    err.name === 'JsonWebTokenError'
  ) {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
    errorSources = [{ path: 'token', message: 'Token is invalid' }];
  } else if (
    err instanceof jwt.TokenExpiredError ||
    err.name === 'TokenExpiredError'
  ) {
    statusCode = 401;
    message = 'Token has expired. Please authenticate again.';
    errorSources = [{ path: 'token', message: 'Token has expired' }];
  }
  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }

  const responsePayload: {
    success: boolean;
    message: string;
    errorSources?: IErrorSource[];
    stack?: string;
  } = {
    success: false,
    message,
    ...(errorSources.length > 0 && { errorSources }),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responsePayload);
};
