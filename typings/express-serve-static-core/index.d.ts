import 'express-serve-static-core';
import { ITokenPayload } from 'modules/services';

declare module 'express-serve-static-core' {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Request {
    token?: ITokenPayload;
  }
}
