import express from 'express';
import * as favoritesControllers from '../controllers/favoritesControllers.js';
import { readRateLimiter, writeRateLimiter } from '../middleware/rateLimiter.js';
import {
  validateNumericId,
  validateNumericField
} from '../middleware/inputValidator.js';

const router = express.Router();

// Toggle favorite with input validation
router.post('/toggle', 
  writeRateLimiter,
  validateNumericField('customerId', true),
  validateNumericField('bookId', true),
  favoritesControllers.toggleFavorite
);

// Add to favorites with input validation
router.post('/add', 
  writeRateLimiter,
  validateNumericField('customerId', true),
  validateNumericField('bookId', true),
  favoritesControllers.addFavorite
);

// Remove from favorites with input validation
router.delete('/remove', 
  writeRateLimiter,
  validateNumericField('customerId', true),
  validateNumericField('bookId', true),
  favoritesControllers.removeFavorite
);

// Get favorite book IDs with input validation
router.get('/:customerId/ids', 
  readRateLimiter,
  validateNumericId('customerId'),
  favoritesControllers.getFavoriteBookIds
);

// Get customer's favorites with input validation
router.get('/:customerId', 
  readRateLimiter,
  validateNumericId('customerId'),
  favoritesControllers.getCustomerFavorites
);

export default router;
