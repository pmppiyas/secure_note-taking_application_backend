import bcrypt from 'bcrypt';
import User from './user.model';
import { IUser } from './user.interface';
import AppError from '../../utils/AppError';
import { getPagination, formatPaginationMeta } from '../../utils/pagination';

const groupUsersByInterests = async () => {
  const result = await User.aggregate([
    {
      $match: {
        'interests.0': { $exists: true },
      },
    },
    {
      $unwind: '$interests',
    },
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: {
          $push: {
            _id: '$_id',
            name: '$name',
            email: '$email',
            role: '$role',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        interest: '$_id',
        count: 1,
        users: 1,
      },
    },
    {
      $sort: {
        count: -1,
        interest: 1,
      },
    },
  ]);

  return result;
};

const getAllUsers = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return {
    meta,
    data: users,
  };
};

const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

const createUser = async (payload: Partial<IUser>) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  const user = await User.create(payload);
  const userWithoutPassword = await User.findById(user._id);
  return userWithoutPassword;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  if (payload.email) {
    const existingUser = await User.findOne({
      email: payload.email,
      _id: { $ne: id },
    });
    if (existingUser) {
      throw new AppError('Email is already taken by another user', 409);
    }
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
};

const deleteUser = async (id: string) => {
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    throw new AppError('User not found', 404);
  }
  return deletedUser;
};

export const UserServices = {
  groupUsersByInterests,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default UserServices;
