import mongoose, { Types } from 'mongoose';
import Post from './post.model';
import User from '../user/user.model';
import { ICreatePostPayload, IUpdatePostPayload } from './post.interface';
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

const getPostById = async (postId: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(postId).populate('userId', 'name email role');
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

const updatePost = async (
  postId: string,
  userId: string,
  requesterRole: string,
  payload: IUpdatePostPayload
) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isOwner = post.userId.toString() === userId;
  const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You can only update your own posts', 403);
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, payload, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email role');

  return updatedPost;
};

const deletePost = async (
  postId: string,
  userId: string,
  requesterRole: string
) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isOwner = post.userId.toString() === userId;
  const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You can only delete your own posts', 403);
  }

  await Post.findByIdAndDelete(postId);
  return post;
};

export const PostServices = {
  createPost,
  getAllPosts,
  getUserPostsWithLookup,
  getPostById,
  updatePost,
  deletePost,
};

export default PostServices;
