/* eslint-disable no-console */
import * as mongoose from 'mongoose';
import { config } from 'config';

export async function mongooseLoader(): Promise<void> {
  const { user, pass, path } = config.mongo;
  const mongoURI = `mongodb://${user}:${pass}${path}`;

  await mongoose.connect(mongoURI, (err: any) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Successfully Connected mongoDB!');
    }
  });
}
