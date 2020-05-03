import mongoose from 'mongoose';
import { config } from 'config';

export async function mongooseLoader(): Promise<typeof mongoose> {
  const { user, pass, path, authSource } = config.mongo;
  const mongoURI = `mongodb://${user}:${pass}@${path}?authSource=${authSource}`;

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };
  try {
    const db = await mongoose.connect(mongoURI, options);
    // eslint-disable-next-line no-console
    console.log('Successfully Connected mongoDB!');
    return db;
  } catch (err) {
    throw new Error(`Mongoose error: ${err.message}`);
  }
}
