import { Schema, model } from 'mongoose';
import { INote } from './note.interface';

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Explicit compound and single indexes
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });

export const Note = model<INote>('Note', noteSchema);
export default Note;
