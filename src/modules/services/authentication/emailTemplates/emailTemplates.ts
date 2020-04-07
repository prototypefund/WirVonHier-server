import { AuthStrategy } from '..';
import { IUser } from 'persistance/models';

export function getEmailSubject(strategy: AuthStrategy, type: string, user: IUser): string {
  return '';
}

export function getEmailBody(strategy: AuthStrategy, type: string, user: IUser): string {
  return '';
}
