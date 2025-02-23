import * as Joi from 'joi';

export const validationSchema = Joi.object({
  QDRANT_URL: Joi.string().default('http://localhost:6333'),
  QDRANT_API_KEY: Joi.string().optional(),
});
