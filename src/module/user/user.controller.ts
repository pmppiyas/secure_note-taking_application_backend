import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import UserServices from './user.services';

const groupUsersByInterests = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await UserServices.groupUsersByInterests();

    res.status(200).json({
      success: true,
      message: 'Users grouped by interests successfully',
      data: result,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await UserServices.getUserById(id);

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await UserServices.updateUser(id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await UserServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  groupUsersByInterests,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default UserController;
