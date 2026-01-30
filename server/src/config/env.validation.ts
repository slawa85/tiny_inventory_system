import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  // Database
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .messages({
      'string.uri': 'DATABASE_URL must be a valid PostgreSQL connection string',
      'any.required': 'DATABASE_URL is required',
    }),

  // Security
  CORS_ALLOWED_ORIGINS: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required().messages({
      'any.required':
        'CORS_ALLOWED_ORIGINS is required in production (comma-separated list of allowed origins)',
    }),
    otherwise: Joi.optional(),
  }),
});
