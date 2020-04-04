/* eslint-disable no-console */
import mongoose from 'mongoose';
import { config } from 'config';

export async function mongooseLoader(): Promise<void> {
  const { user, pass, path } = config.mongo;
  const mongoURI = `mongodb://${user}:${pass}@${path}`;

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };
  await mongoose.connect(mongoURI, options).then(
    () => console.log('Successfully Connected mongoDB!'),
    (err) => console.log('Mongoose error: ', err.message),
  );
}
