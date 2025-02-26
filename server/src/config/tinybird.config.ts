import { registerAs } from '@nestjs/config';

export default registerAs('tinybird', () => ({
  apiEndpoint: process.env.TINYBIRD_API_ENDPOINT,
  apiToken: process.env.TINYBIRD_API_TOKEN,
}));
