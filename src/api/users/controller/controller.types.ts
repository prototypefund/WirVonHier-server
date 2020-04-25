import { RequestHandler } from 'express';

export interface IUserController {
  allUsers: RequestHandler;
  createUsers: RequestHandler;
  oneUser: RequestHandler;
  updateUser: RequestHandler;
  deleteUser: RequestHandler;
}
