import joi from '@hapi/joi';

const envVarsSchema = joi
  .object({
    NODE_ENV: joi.string().allow(['development', 'production', 'test', 'provision']).required(),
    PORT: joi.number().required(),
    MONGO_USER: joi.string().required(),
    MONGO_PASSWORD: joi.string().required(),
    MONGO_PATH: joi.string().required(),
    MONGO_AUTH_SOURCE: joi.string().required(),
    SENDGRID_API_KEY: joi.string().required(),
    HOST_LOCAL: joi.string().required(),
    HOST_LOCAL_TWO: joi.string().required(),
    HOST_TEST: joi.string().required(),
    HOST_PROD: joi.string().required(),
    CLOUDINARY_CLOUD_NAME: joi.string().required(),
    CLOUDINARY_API_SECRET: joi.string().required(),
    CLOUDINARY_API_KEY: joi.string().required(),
    VIMEO_ACCESS_TOKEN: joi.string().required(),
  })
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  server: {
    port: envVars.PORT,
  },
  mongo: {
    user: envVars.MONGO_USER,
    pass: envVars.MONGO_PASSWORD,
    path: envVars.MONGO_PATH,
    authSource: envVars.MONGO_AUTH_SOURCE,
  },
  sendgrid: {
    apiKey: envVars.SENDGRID_API_KEY,
  },
  hosts: [envVars.HOST_LOCAL_TWO, envVars.HOST_LOCAL, envVars.HOST_PROD, envVars.HOST_TEST],
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  vimeo: {
    accessToken: envVars.VIMEO_ACCESS_TOKEN,
  },
};
