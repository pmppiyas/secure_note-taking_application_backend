import { Types } from 'mongoose';

export interface INote {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateNotePayload {
  title: string;
  content: string;
}

export interface IUpdateNotePayload {
  title?: string;
  content?: string;
}
