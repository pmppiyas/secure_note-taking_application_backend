import { Types } from 'mongoose';
import Note from './note.model';
import { ICreateNotePayload, IUpdateNotePayload } from './note.interface';
import AppError from '../../utils/AppError';
import { getPagination, formatPaginationMeta } from '../../utils/pagination';

const createNote = async (userId: string, payload: ICreateNotePayload) => {
  const note = await Note.create({
    ...payload,
    userId: new Types.ObjectId(userId),
  });
  return note;
};

const getMyNotes = async (userId: string, query: any) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { userId: new Types.ObjectId(userId) };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return {
    meta,
    data: notes,
  };
};

const getAllNotesForAdmin = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const [notes, total] = await Promise.all([
    Note.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role'),
    Note.countDocuments({}),
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return {
    meta,
    data: notes,
  };
};

const getNoteById = async (
  noteId: string,
  requesterId: string,
  requesterRole: string
) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  const isOwner = note.userId.toString() === requesterId;
  const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You can only view your own notes', 403);
  }

  return note;
};

const updateNote = async (
  noteId: string,
  userId: string,
  requesterRole: string,
  payload: IUpdateNotePayload
) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  const isOwner = note.userId.toString() === userId;
  const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You can only update your own notes', 403);
  }

  const updatedNote = await Note.findByIdAndUpdate(noteId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedNote;
};

const deleteNote = async (
  noteId: string,
  userId: string,
  requesterRole: string
) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  const isOwner = note.userId.toString() === userId;
  const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: You can only delete your own notes', 403);
  }

  await Note.findByIdAndDelete(noteId);

  return note;
};

export const NoteServices = {
  createNote,
  getMyNotes,
  getAllNotesForAdmin,
  getNoteById,
  updateNote,
  deleteNote,
};

export default NoteServices;
