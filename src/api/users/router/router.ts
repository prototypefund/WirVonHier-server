import { Router } from 'express';
import { usersController as uc } from '../controller';

export const userRouter = Router();

userRouter.get(`/users`, uc.allUsers.bind(uc));
userRouter.post(`/users`, uc.createUsers.bind(uc));
userRouter.get(`/users/:id`, uc.oneUser.bind(uc));
userRouter.patch(`/users/:id`, uc.updateUser.bind(uc));
userRouter.delete(`/users/:id`, uc.deleteUser.bind(uc));
