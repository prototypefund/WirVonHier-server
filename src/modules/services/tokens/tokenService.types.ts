import { IRole } from 'persistance/models';

export interface ITokenPayload {
  id: string;
  email?: string;
  roles?: Array<IRole['name']>;
  type?: string;
}
