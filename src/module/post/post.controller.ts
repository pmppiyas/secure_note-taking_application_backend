import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import PostServices from './post.services';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await PostServices.createPost(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getAllPosts(req.query);

  res.status(200).json({
    success: true,
    message: 'Posts retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserPostsWithLookup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const result = await PostServices.getUserPostsWithLookup(userId);

  res.status(200).json({
    success: true,
    message: 'User posts retrieved successfully',
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  getUserPostsWithLookup,
};

export default PostController;
