import { AuthStrategy } from '..';
import { IUser } from 'persistance/models';

export function getEmailSubject(strategy: AuthStrategy, type: string, user: IUser): string {
  return `${strategy} ${type} ${user}`;
}

export function getEmailBody(strategy: AuthStrategy, type: string, user: IUser): string {
  return `${strategy} ${type} ${user}`;
}
