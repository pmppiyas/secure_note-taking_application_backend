import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

export interface AuthUser {
  userId: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'You are not logged in! Please log in to get access.',
        401
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(
        'You are not logged in! Please log in to get access.',
        401
      );
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload &
      AuthUser;

    if (!decoded.userId || !decoded.role) {
      throw new AppError('Invalid token payload', 401);
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  }
);

export const authorize = (...roles: ('USER' | 'ADMIN')[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('You are not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
