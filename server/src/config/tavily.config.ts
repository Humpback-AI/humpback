import { registerAs } from '@nestjs/config';

export default registerAs('tavily', () => ({
  apiKey: process.env.TAVILY_API_KEY,
}));
