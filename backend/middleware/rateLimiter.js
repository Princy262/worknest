import rateLimit from 'express-rate-limit';

// Strict limit for anything where someone could guess a password.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // the time window: 15 minutes
  limit: 10, // allowed attempts per IP in that window
  skipSuccessfulRequests: true, // successful logins don't count, only failures
  standardHeaders: 'draft-7', // adds RateLimit-* headers so clients can see the limit
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Generous limit for the whole API, to stop floods of requests.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down and try again later.' },
});