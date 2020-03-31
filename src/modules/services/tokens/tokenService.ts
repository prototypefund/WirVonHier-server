import * as JWT from 'jsonwebtoken';
import { ITokenPayload } from './tokenService.types';

class TokenService {
  private secretKey: string;
  private sessionExpiresIn: number;

  constructor({ secretKey = 'secret_key', expiresIn = 300 }: { secretKey?: string; expiresIn?: number }) {
    this.secretKey = secretKey;
    this.sessionExpiresIn = expiresIn;
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
}

export const tokenService = new TokenService({});
