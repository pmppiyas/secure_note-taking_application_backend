import mongoose, { Types } from 'mongoose';
import Post from './post.model';
import User from '../user/user.model';
import { ICreatePostPayload } from './post.interface';
import AppError from '../../utils/AppError';
import { getPagination, formatPaginationMeta } from '../../utils/pagination';

const createPost = async (userId: string, payload: ICreatePostPayload) => {
  const post = await Post.create({
    ...payload,
    userId: new Types.ObjectId(userId),
  });
  return post;
};

const getAllPosts = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const [posts, total] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    Post.countDocuments({}),
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return {
    meta,
    data: posts,
  };
};

const getUserPostsWithLookup = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const result = await User.aggregate([
    // Stage 1: Match the specific user by _id (uses built-in _id_ index)
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    // Stage 2: $lookup posts belonging to this user (supported by { userId: 1 } index on Post)
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'userId',
        pipeline: [{ $sort: { createdAt: -1 } }],
        as: 'posts',
      },
    },
    // Stage 3: Exclude sensitive password field
    {
      $project: {
        password: 0,
      },
    },
  ]);

  if (!result || result.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result[0];
};

export const PostServices = {
  createPost,
  getAllPosts,
  getUserPostsWithLookup,
};

export default PostServices;
