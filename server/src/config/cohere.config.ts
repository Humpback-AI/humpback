import { registerAs } from '@nestjs/config';

export default registerAs('cohere', () => ({
  apiKey: process.env.COHERE_API_KEY,
}));
