export type IUserRole = 'USER' | 'ADMIN';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: IUserRole;
  interests: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
