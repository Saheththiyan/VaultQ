import rateLimit from 'express-rate-limit';

export const questionRateLimiter = rateLimit({
    windowMs: 60 * 1000, max: 10,
    message: { error: 'Too many submissions. Please wait.' },
    standardHeaders: true, legacyHeaders: false,
});

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 20,
    message: { error: 'Too many login attempts.' },
    standardHeaders: true, legacyHeaders: false,
});
