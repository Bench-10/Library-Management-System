import express from 'express';
import * as userControllers from '../controllers/userControllers.js';
import { authRateLimiter, writeRateLimiter } from '../middleware/rateLimiter.js';
import {
  validateString,
  validateEmail,
  validatePassword,
  validatePhone
} from '../middleware/inputValidator.js';

const router = express.Router();

// User registration with input validation
router.post("/user/register", 
  writeRateLimiter,
  validateString('firstName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateString('lastName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateEmail('email', true),
  validatePassword('password', true),
  validatePhone('phoneNumber', false),
  validateString('address', 255, null, false),
  userControllers.registerUser
);

// User login with input validation
router.post("/user/login", 
  authRateLimiter,
  validateEmail('email', true),
  validatePassword('password', true),
  validateString('role', 20, /^(customer|staff)$/, true),
  userControllers.loginUser
);

export default router;