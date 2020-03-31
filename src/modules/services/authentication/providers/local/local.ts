import { RequestHandler } from 'express-serve-static-core';
import * as Joi from 'joi';
import { User } from 'persistance/models';
import { tokenService as ts } from 'modules/services';
import { hashingService as hs } from 'modules/services';
import { IAuthResponse } from '../../authService.types';

export const register: RequestHandler = async function register(req): Promise<IAuthResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = Joi.validate<{ email: string; password: string }>(req.body, schema);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return { error: { status: 406, message: 'User already exists.' } };

  const { email, password } = req.body;
  user = new User({ email, password });

  const newUser = await user.save();

  const token = ts.generateToken({ id: newUser.id, email: newUser.email, roles: newUser.roles });
  return { token };
};

export const login: RequestHandler = async function login(req): Promise<IAuthResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = Joi.validate<{ email: string; password: string }>(req.body, schema);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return { error: { status: 406, message: 'Email or password incorrect.' } };

  if (!hs.checkPassword(password, user.password))
    return { error: { status: 406, message: 'Email or password incorrect.' } };

  const token = ts.generateToken({ id: user.id, email: user.email, roles: user.roles });
  return { token };
};
