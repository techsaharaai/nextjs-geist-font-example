import { registerAs } from '@nestjs/config';

export const throttlerConfig = registerAs('throttler', () => ({
  ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
}));
