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
}

const getDashboardMetadata = async (
  userId: string,
  role: string
): Promise<IDashboardMetadata> => {
  const userObjectId = new Types.ObjectId(userId);

  const [myNotesCount, myPostsCount, totalPostsCount, userDoc] =
    await Promise.all([
      Note.countDocuments({ userId: userObjectId }),
      Post.countDocuments({ userId: userObjectId }),
      Post.countDocuments({}),
      User.findById(userObjectId).select('interests name email role'),
    ]);

  if (!userDoc) {
    throw new AppError('User not found', 404);
  }

  const isAdmin = role.toUpperCase() === 'ADMIN';

  let totalNotesCount: number | undefined;
  let totalUsersCount: number | undefined;

  if (isAdmin) {
    [totalNotesCount, totalUsersCount] = await Promise.all([
      Note.countDocuments({}),
      User.countDocuments({}),
    ]);
  }

  return {
    myNotesCount,
    myPostsCount,
    totalPostsCount,
    interestsCount: userDoc.interests?.length || 0,
    interests: userDoc.interests || [],
    ...(isAdmin ? { totalNotesCount, totalUsersCount } : {}),
  };
};

export const MetadataServices = {
  getDashboardMetadata,
};

export default MetadataServices;
