import * as favoritesServices from '../services/favoritesServices.js';

// Add book to favorites
export const addFavorite = async (req, res) => {
  try {
    const { customerId, bookId } = req.body;

    if (!customerId || !bookId) {
      return res.status(400).json({ 
        message: 'Customer ID and Book ID are required' 
      });
    }

    const favorite = await favoritesServices.addToFavorites(customerId, bookId);
    
    res.status(201).json({
      message: 'Added to favorites',
      data: favorite
    });
  } catch (error) {
    if (error.message === 'Book is already in favorites') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Failed to add to favorites',
      error: error.message 
    });
  }
};

// Remove book from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { customerId, bookId } = req.body;

    if (!customerId || !bookId) {
      return res.status(400).json({ 
        message: 'Customer ID and Book ID are required' 
      });
    }

    const result = await favoritesServices.removeFromFavorites(customerId, bookId);
    
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Favorite not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Failed to remove from favorites',
      error: error.message 
    });
  }
};

// Get customer's favorites
export const getCustomerFavorites = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ 
        message: 'Customer ID is required' 
      });
    }

    const favorites = await favoritesServices.getCustomerFavorites(customerId);
    
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch favorites',
      error: error.message 
    });
  }
};

// Get favorite book IDs for a customer
export const getFavoriteBookIds = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ 
        message: 'Customer ID is required' 
      });
    }

    const bookIds = await favoritesServices.getFavoriteBookIds(customerId);
    
    res.status(200).json(bookIds);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch favorite book IDs',
      error: error.message 
    });
  }
};


export const toggleFavorite = async (req, res) => {
  try {
    const { customerId, bookId } = req.body;


    if (!customerId || !bookId) {
      return res.status(400).json({ 
        message: 'Customer ID and Book ID are required' 
      });
    }

    const isFavorited = await favoritesServices.isFavorited(customerId, bookId);

    if (isFavorited) {
      await favoritesServices.removeFromFavorites(customerId, bookId);
      return res.status(200).json({ 
        message: 'Removed from favorites',
        isFavorited: false 
      });
    } else {
      const favorite = await favoritesServices.addToFavorites(customerId, bookId);
      return res.status(201).json({ 
        message: 'Added to favorites',
        isFavorited: true,
        data: favorite 
      });
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ 
      message: 'Failed to toggle favorite',
      error: error.message 
    });
  }
};
