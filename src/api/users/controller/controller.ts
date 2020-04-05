import { Request, Response } from 'express-serve-static-core';
import { IUserController } from './controller.types';
import { userService as us } from '../service';

export class UserController implements IUserController {
  [key: string]: import('express').RequestHandler<import('express-serve-static-core').ParamsDictionary>;

  /**
   * Returns all user, optional filtered by query parameters
   *
   * Pagination applies
   */
  static async allUsers(req: Request, res: Response): Promise<void> {
    if (req.token) {
      res.status(401);
      return;
    }
    const { query } = req;
    const allUsers = await us.getFilteredUsers(query);
    res.status(200).json(allUsers);
  }

  /**
   * Creates users, returns the created users
   */
  static async createUsers(req: Request, res: Response): Promise<void> {
    if (req.token) {
      res.status(401);
      return;
    }
    const users = req.body.users; // TODO: Validate input
    const createdUsers = await us.createUsers(users);
    res.status(200).json(createdUsers);
  }
  /**
   * Returns the user with passed id or nothing
   */
  static async oneUser(req: Request, res: Response): Promise<void> {
    if (req.token) {
      res.status(401);
      return;
    }
    const userId = req.params.id;
    const user = await us.getOneUserById(userId);
    res.status(200).json(user);
  }

  /**
   * Updates the user with passed id, returns nothing
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    if (req.token) {
      res.status(401);
      return;
    }
    const userId = req.params.id;
    const updates = req.body.user; // TODO: Validate input
    const updatedUser = await us.updateOneUser(userId, updates);
    res.status(200).json(updatedUser);
  }

  /**
   * Deletes the user with passed id, returns nothing
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    if (req.token) {
      res.status(401);
      return;
    }
    const userId = req.params.id;
    try {
      await us.deleteOneUser(userId);
      res.status(204);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}
