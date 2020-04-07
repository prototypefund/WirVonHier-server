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
} from '../../api';

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

  // configure cross origin resource sharing
  app.use(
    cors({
      origin: 'http://0.0.0.0:8080',
      methods: 'GET,POST,PATCH,OPTIONS,DELETE',
      credentials: true,
    }),
  );

  registerAuthenticationModule(app);
  registerHealthModule(app);
  registerUserModule(app);
  registerBusinessesModule(app);
}
