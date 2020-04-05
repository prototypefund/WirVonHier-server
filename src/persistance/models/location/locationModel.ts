import * as mongoose from 'mongoose';
import { ILocation } from './location.types';
import { LocationSchema } from './locationSchema';

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
