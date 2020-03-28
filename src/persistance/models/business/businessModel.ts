import * as mongoose from 'mongoose';
import { IBusiness } from './business.types';
import { BusinessSchema } from './businessSchema';

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
