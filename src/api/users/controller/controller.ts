import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { IUserController } from './controller.types';
import { userService as us } from '../service';

export class UserController implements IUserController {
  /**
   * Returns all user, optional filtered by query parameters
   *
   * Pagination applies
   */
  async allUsers(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
      return;
    }
    const { query } = req;
    const allUsers = await us.getFilteredUsers(query as { [key: string]: string });
    res.status(200).json(allUsers);
  }

  /**
   * Creates users, returns the created users
   */
  async createUsers(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
      return;
    }
    const users = req.body.users; // TODO: Validate input
    const createdUsers = await us.createUsers(users);
    res.status(200).json(createdUsers);
  }
  /**
   * Returns the user with passed id or nothing
   */
  async oneUser(req: Request, res: Response): Promise<void> {
    if (!req.token) return res.status(401).end('User not authorized.');
    const userId = req.params.id;
    if (req.token.id !== userId) return res.status(403).end('Not allowed.');
    const user = await us.getOneUserById(userId);
    res.status(200).json(user).end();
  }

  /**
   * Updates the user with passed id, returns nothing
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      const schema = Joi.object().keys({
        newPassword: Joi.string().required(),
      });
      const { error, value } = Joi.validate<{ newPassword: string }>(req.body, schema);
      if (error) {
        res.status(400).send(error.details[0].message);
      }
      const userId = req.params.id;
      const { status, message } = await us.updatePassword(userId, value.newPassword);
      res.status(status).end(message);
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
  async deleteUser(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
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

export const usersController = new UserController();
