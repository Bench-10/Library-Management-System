import pool from "../db.js";

// Add a book to favorites
export const addToFavorites = async (customerId, bookId) => {
  try {
    const result = await pool.query(
      `INSERT INTO favorites (customer_id, book_id)
       VALUES ($1, $2)
       ON CONFLICT (customer_id, book_id) DO NOTHING
       RETURNING 
         favorite_id,
         customer_id,
         book_id,
         TO_CHAR(added_date, 'Mon DD, YYYY HH12:MI AM') as added_date`,
      [customerId, bookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Book is already in favorites');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove a book from favorites
export const removeFromFavorites = async (customerId, bookId) => {
  try {
    const result = await pool.query(
      `DELETE FROM favorites
       WHERE customer_id = $1 AND book_id = $2
       RETURNING favorite_id`,
      [customerId, bookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Favorite not found');
    }

    return { message: 'Removed from favorites' };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Get all favorites for a customer with full book details
export const getCustomerFavorites = async (customerId) => {
  try {
    const result = await pool.query(
      `SELECT 
         f.favorite_id,
         f.customer_id,
         f.book_id,
         b.title,
         b.author,
         b.genre,
         TO_CHAR(b.published_date, 'Mon DD YYYY') as published_date,
         b.total_copies,
         b.available_copies,
         b.rating,
         TO_CHAR(f.added_date, 'Mon DD, YYYY HH12:MI AM') as added_date
       FROM favorites f
       JOIN books b ON f.book_id = b.book_id
       WHERE f.customer_id = $1
       ORDER BY b.title ASC`,
      [customerId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching customer favorites:', error);
    throw error;
  }
};

// Check if a book is favorited by a customer
export const isFavorited = async (customerId, bookId) => {
  try {
    const result = await pool.query(
      `SELECT favorite_id FROM favorites
       WHERE customer_id = $1 AND book_id = $2`,
      [customerId, bookId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

// Get all favorite book IDs for a customer (lightweight)
export const getFavoriteBookIds = async (customerId) => {
  try {
    const result = await pool.query(
      `SELECT book_id FROM favorites WHERE customer_id = $1`,
      [customerId]
    );

    return result.rows.map(row => row.book_id);
  } catch (error) {
    console.error('Error fetching favorite book IDs:', error);
    throw error;
  }
};
