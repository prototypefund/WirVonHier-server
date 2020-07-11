import { Request, RequestHandler } from 'express-serve-static-core';
import * as Joi from '@hapi/joi';
import { User } from 'persistance/models';
import { tokenService as ts } from 'modules/services';
import { hashingService as hs } from 'modules/services';
import { IAuthResponse, IAuthErrorResponse } from '../../authService.types';
import { DataProtStatement } from 'persistance/models';
import { authService } from 'modules/services/authentication';

export async function register(this: typeof authService, req: Request): Promise<IAuthResponse | IAuthErrorResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    dataProtStatement: Joi.string().required(),
    dataProtStatementLang: Joi.string().allow(['en', 'de']).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }
  const dataProtStatement = await DataProtStatement.findOne({
    version: value.dataProtStatement,
    language: value.dataProtStatementLang,
  });

  if (!dataProtStatement) {
    return { error: { status: 406, message: 'Invalid Data-Protection statement Id.' } };
  }
  const { email, password } = value;
  const user = await User.findOne({ email });
  if (user) return { error: { status: 406, message: 'User already exists.' } };
  const newUser = new User({ email, password, acceptedDataProtStatements: [dataProtStatement._id] });
  await newUser.save();
  await this.sendVerificationEmail(newUser);

  // Authentication Token
  const token = ts.generateToken({ id: newUser.id, email: newUser.email, roles: newUser.roles });
  const refreshToken = ts.generateRefreshToken({ id: newUser.id, email: newUser.email, roles: newUser.roles });
  const publicRefreshToken = ts.generateRefreshToken({ id: newUser.id });
  await newUser.save();
  return { token, refreshToken, publicRefreshToken };
}

export const login: RequestHandler = async function login(req): Promise<IAuthResponse | IAuthErrorResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return { error: { status: 406, message: 'Email or password incorrect.' } };

  if (!hs.checkPassword(password, user.password))
    return { error: { status: 406, message: 'Email or password incorrect.' } };

  const token = ts.generateToken({ id: user.id, email: user.email, roles: user.roles });
  const refreshToken = ts.generateRefreshToken({ id: user.id, email: user.email, roles: user.roles });
  const publicRefreshToken = ts.generateRefreshToken({ id: user.id });
  return { token, refreshToken, publicRefreshToken };
};

export async function requestNewPassword(
  this: typeof authService,
  req: Request,
): Promise<{ status: number; message?: string }> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return { status: 406, message: error.details[0].message };
  }
  const { email } = value;
  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: 400,
      message: `Failed to reset password for: ${email}.`,
    };
  }
  this.sendResetPasswordMail(user);
  return {
    status: 204,
  };
}

export async function resetPassword(req: Request): Promise<{ status: number; message?: string }> {
  const schema = Joi.object().keys({
    password: Joi.string().required(),
    token: Joi.string().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return { status: 406, message: error.details[0].message };
  }
  const { password, token } = value;
  const payload = ts.verify(token);
  if (!payload) {
    return { status: 403, message: 'Not authorized. Invalid Token.' };
  }
  const { id, type } = payload;
  if (type !== 'reset-password') {
    return { status: 403, message: 'Not authorized. Invalid Token.' };
  }
  const user = await User.findById(id);
  if (!user) {
    return {
      status: 400,
      message: 'Could not find user. May have been since token has been issued.',
    };
  }
  if (user.resetPasswordToken !== token) return { status: 403, message: "Tokens don't match." };
  user.resetPasswordToken = undefined;
  user.password = password;
  try {
    await user.save();
    return { status: 204 };
  } catch (error) {
    return { status: 500 };
  }
}
