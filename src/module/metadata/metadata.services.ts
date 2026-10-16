import { Types } from 'mongoose';
import Note from '../note/note.model';
import Post from '../post/post.model';
import User from '../user/user.model';
import AppError from '../../utils/AppError';

export interface IDashboardMetadata {
  myNotesCount: number;
  myPostsCount: number;
  totalPostsCount: number;
  interestsCount: number;
  interests: string[];
  totalNotesCount?: number;
  totalUsersCount?: number;
  totalCategoriesCount?: number;
}

const getDashboardMetadata = async (
  userId: string,
  role: string
): Promise<IDashboardMetadata> => {
  const userObjId = Types.ObjectId.isValid(userId)
    ? new Types.ObjectId(userId)
    : null;

  const userFilter = userObjId
    ? { $or: [{ userId: userObjId }, { userId: userId.toString() }] }
    : { userId: userId.toString() };

  const [myNotesCount, myPostsCount, totalPostsCount, userDoc] =
    await Promise.all([
      Note.countDocuments(userFilter),
      Post.countDocuments(userFilter),
      Post.countDocuments({}),
      userObjId
        ? User.findById(userObjId).select('interests name email role')
        : User.findOne({ _id: userId }).select('interests name email role'),
    ]);

  if (!userDoc) {
    throw new AppError('User not found', 404);
  }

  const isAdmin = role.toUpperCase() === 'ADMIN';

  let totalNotesCount: number | undefined;
  let totalUsersCount: number | undefined;
  let totalCategoriesCount: number | undefined;

  if (isAdmin) {
    const [allNotes, allUsers, categoriesAggregation] = await Promise.all([
      Note.countDocuments({}),
      User.countDocuments({}),
      User.aggregate([
        { $match: { 'interests.0': { $exists: true } } },
        { $unwind: '$interests' },
        { $group: { _id: '$interests' } },
        { $count: 'total' },
      ]),
    ]);

    totalNotesCount = allNotes;
    totalUsersCount = allUsers;
    totalCategoriesCount = categoriesAggregation[0]?.total || 0;
  }

  return {
    myNotesCount,
    myPostsCount,
    totalPostsCount,
    interestsCount: userDoc.interests?.length || 0,
    interests: userDoc.interests || [],
    ...(isAdmin
      ? {
          totalNotesCount,
          totalUsersCount,
          totalCategoriesCount,
        }
      : {}),
  };
};

const getAdminMetadata = async (
  adminId: string
): Promise<IDashboardMetadata> => {
  return getDashboardMetadata(adminId, 'ADMIN');
};

export const MetadataServices = {
  getDashboardMetadata,
  getAdminMetadata,
};

export default MetadataServices;
