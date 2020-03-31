import { model } from 'mongoose';
import { IRole, IRoleModel } from './role.types';
import { RoleSchema } from './roleSchema';

export const Role = model<IRole, IRoleModel>('User', RoleSchema);
