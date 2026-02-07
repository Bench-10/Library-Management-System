import express from 'express';
import * as favoritesControllers from '../controllers/favoritesControllers.js';

const router = express.Router();

// Toggle favorite (must be before /:customerId route)
router.post('/toggle', favoritesControllers.toggleFavorite);

// Add to favorites
router.post('/add', favoritesControllers.addFavorite);

// Remove from favorites
router.delete('/remove', favoritesControllers.removeFavorite);

// Get favorite book IDs (must be before /:customerId route)
router.get('/:customerId/ids', favoritesControllers.getFavoriteBookIds);

// Get customer's favorites
router.get('/:customerId', favoritesControllers.getCustomerFavorites);

export default router;
