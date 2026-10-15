import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../user/user.model';
import { IUser, IUserRole } from '../user/user.interface';
import { IRegisterPayload, ILoginPayload, IAuthResponse } from './auth.interface';
import AppError from '../../utils/AppError';
import config from '../../config';

const createToken = (payload: { userId: string; role: IUserRole }): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign(payload, config.jwtSecret, options);
};

const register = async (payload: IRegisterPayload): Promise<IAuthResponse> => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newUser = await User.create({
    ...payload,
    password: hashedPassword,
  });

  const token = createToken({
    userId: newUser._id.toString(),
    role: newUser.role,
  });

  const user = await User.findById(newUser._id);

  return {
    user: user ? user.toObject() : newUser.toObject(),
    token,
  };
};

const login = async (payload: ILoginPayload): Promise<IAuthResponse> => {
  const user = await User.findOne({ email: payload.email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user.password || ''
  );
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = createToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const userObj = user.toObject();
  delete userObj.password;

  return {
    user: userObj,
    token,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const AuthServices = {
  register,
  login,
  getMe,
};

export default AuthServices;
