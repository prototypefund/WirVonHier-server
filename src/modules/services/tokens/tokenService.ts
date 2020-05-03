import * as JWT from 'jsonwebtoken';
import { ITokenPayload } from './tokenService.types';
import { IUser } from 'persistance/models';

class TokenService {
  private secretKey: string;
  private sessionExpiresIn: number;
  private refreshTokenExpiresIn: number;

  constructor({ secretKey = 'secret_key', expiresIn = 300 }: { secretKey?: string; expiresIn?: number }) {
    this.secretKey = secretKey;
    this.sessionExpiresIn = expiresIn;
    this.refreshTokenExpiresIn = 60 * 60 * 24 * 30; // 1 Monat
  }

  public verify(token: string): ITokenPayload | null {
    if (!token) return null;
    try {
      return JWT.verify(token, this.secretKey) as ITokenPayload;
    } catch (error) {
      return null;
    }
  }

  generateToken(payload: ITokenPayload, expiresIn?: number): string {
    return JWT.sign(payload, this.secretKey, {
      algorithm: 'HS256',
      expiresIn: expiresIn || this.sessionExpiresIn,
    });
  }

  generateRefreshToken(payload: ITokenPayload): string {
    return JWT.sign(payload, this.secretKey, {
      algorithm: 'HS256',
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  createResetPasswordToken(user: IUser): string {
    const token = JWT.sign(
      {
        id: user._id,
        type: 'reset-password',
      },
      this.secretKey,
      {
        algorithm: 'HS256',
        expiresIn: 60 * 30, // 30 min
      },
    );

    user.update({ changeEmailToken: token });
    return token;
  }

  createVerificationToken(user: IUser): string {
    const token = JWT.sign(
      {
        id: user._id,
        type: 'emailVerification',
      },
      this.secretKey,
      {
        algorithm: 'HS256',
        expiresIn: 60 * 30,
      },
    );
    return token;
  }
}

export const tokenService = new TokenService({});
