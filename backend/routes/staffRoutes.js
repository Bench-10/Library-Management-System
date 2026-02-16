import express from 'express';
import * as staffControllers from '../controllers/staffControllers.js';
import { verifyToken } from '../middleware/authController.js';
import { authorize } from "../middleware/roleBaseAccessController.js";
import { readRateLimiter, writeRateLimiter } from "../middleware/rateLimiter.js";
import {
  validateNumericId,
  validateString,
  validateEmail,
  validatePassword,
  validatePhone,
  validateBoolean
} from '../middleware/inputValidator.js';

const router = express.Router();

// Get all staff members
router.get('/staff', 
  readRateLimiter, 
  verifyToken, 
  authorize(['admin']), 
  staffControllers.getAllStaff
);

// Add new staff member with input validation
router.post('/staff', 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']),
  validateString('firstName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateString('lastName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateEmail('email', true),
  validatePassword('password', true),
  validatePhone('phoneNumber', false),
  validateBoolean('isAdmin', false),
  staffControllers.addStaff
);

// Update staff member with input validation
router.put('/staff/:staffId', 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']),
  validateNumericId('staffId'),
  validateString('firstName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateString('lastName', 50, /^[a-zA-Z\s\-'.]+$/, true),
  validateEmail('email', true),
  validatePhone('phoneNumber', false),
  validateBoolean('isAdmin', false),
  staffControllers.updateStaff
);

// Delete staff member with input validation
router.delete('/staff/:staffId', 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']),
  validateNumericId('staffId'),
  staffControllers.deleteStaff
);

export default router;
