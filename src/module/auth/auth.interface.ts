import { IUser, IUserRole } from '../user/user.interface';

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: IUserRole;
  interests?: string[];
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Partial<IUser>;
  token: string;
}
