import { registerAs } from '@nestjs/config';

export default registerAs('internal', () => ({
  secretKey: process.env.INTERNAL_SECRET_KEY,
}));
