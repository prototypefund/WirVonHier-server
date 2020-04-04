import { model } from 'mongoose';
import { IDataProtStatement, IDataProtStatementModel } from './dataProtStatement.types';
import { DataProtectionStatementSchema } from './dataProtStatementSchema';

export const DataProtStatement = model<IDataProtStatement, IDataProtStatementModel>(
  'DataProtStatement',
  DataProtectionStatementSchema,
);
