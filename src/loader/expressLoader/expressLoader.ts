import { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {
  registerAuthenticationModule,
  registerHealthModule,
  registerUserModule,
  registerBusinessesModule,
  registerDataProtStatementModule,
  registerImagesModule,
  registerVideosModule,
} from '../../api';
import { config } from 'config';

export function expressLoader(app: Application): void {
  // some sane defaults for application security
  app.use(helmet());

  // request logger
  app.use(morgan('dev'));

  // support application/json type post data
  app.use(bodyParser.json());

  // support application/x-www-form-urlencoded post data
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse cookie header and populare req.cookies
  app.use(cookieParser());

  app.disable('etag');

  // configure cross origin resource sharing
  const corsWhitelist = config.hosts;
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (requestOrigin === undefined) {
          callback(null, true);
        } else if (corsWhitelist.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: 'GET,POST,PATCH,OPTIONS,DELETE',
      credentials: true,
    }),
  );

  registerAuthenticationModule(app);
  registerHealthModule(app);
  registerUserModule(app);
  registerBusinessesModule(app);
  registerImagesModule(app);
  registerVideosModule(app);
  registerDataProtStatementModule(app);
}
