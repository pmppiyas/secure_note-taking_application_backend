import { Types } from 'mongoose';

export interface IPost {
  title: string;
  body: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreatePostPayload {
  title: string;
  body: string;
}

export interface IUpdatePostPayload {
  title?: string;
  body?: string;
}
