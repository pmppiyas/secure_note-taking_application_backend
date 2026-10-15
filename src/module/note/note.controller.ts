import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import NoteServices from './note.services';

const createNote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NoteServices.createNote(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: result,
  });
});

const getMyNotes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NoteServices.getMyNotes(userId, req.query);

  res.status(200).json({
    success: true,
    message: 'My notes retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllNotesForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteServices.getAllNotesForAdmin(req.query);

  res.status(200).json({
    success: true,
    message: 'All notes retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await NoteServices.getNoteById(id, userId, role);

  res.status(200).json({
    success: true,
    message: 'Note retrieved successfully',
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await NoteServices.updateNote(id, userId, role, req.body);

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: result,
  });
});

const deleteNote = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await NoteServices.deleteNote(id, userId, role);

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
    data: result,
  });
});

export const NoteController = {
  createNote,
  getMyNotes,
  getAllNotesForAdmin,
  getNoteById,
  updateNote,
  deleteNote,
};

export default NoteController;
