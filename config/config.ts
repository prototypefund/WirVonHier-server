import joi from 'joi';

const envVarsSchema = joi
  .object({
    NODE_ENV: joi.string().allow(['development', 'production', 'test', 'provision']).required(),
    PORT: joi.number().required(),
    MONGO_USER: joi.string().required(),
    MONGO_PASSWORD: joi.string().required(),
    MONGO_PATH: joi.string().required(),
    SENDGRID_API_KEY: joi.string().required(),
    HOST_LOCAL: joi.string().required(),
    HOST_TEST: joi.string().required(),
    HOST_PROD: joi.string().required(),
  })
  .unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

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
  },
  sendgrid: {
    apiKey: envVars.SENDGRID_API_KEY,
  },
  hosts: [envVars.HOST_LOCAL, envVars.HOST_PROD, envVars.HOST_TEST],
};
