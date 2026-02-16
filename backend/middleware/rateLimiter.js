import rateLimit from "express-rate-limit";

//Rate limit on read operation: MAX 100 requests a minute per IP
export const readRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  legacyHeaders: false,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later."
  }
});


//Rate limit on write operations: MAX 20 requests a minute per IP
export const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  legacyHeaders: false,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later."
  }
});


//Rate limit on write operations: MAX 5 requests a minute per IP
export const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5, 
  legacyHeaders: false,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later."
  }
});