import pool  from "../db.js";

//Function to get all books from the database
export const getAllBooks = async () =>{

    try {
      const result = await pool.query(`
        SELECT 
          book_id,
          title,
          author,
          genre,
          TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
          total_copies,
          available_copies,
          rating 
        FROM books
      `);
      const books = result.rows;
      return books;
    } catch (error) {
      console.error('Error fetching books from database:', error);
    }
  
}

export const addNewBook = async (bookData) => {
  const { title, author, genre, publishDate, copies, price } = bookData;

  try {
    const data = await pool.query(`
      INSERT INTO books ( title, author, genre, published_date, total_copies, available_copies, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING 
        book_id,
        title,
        author,
        genre,
        TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
        total_copies,
        available_copies,
        rating,
        price
    `, [title, author, genre, publishDate, copies, copies, price]);

    return data.rows[0];

  } catch (error) {
    console.error('Error adding books from database:', error);
  }
}

export const updateBook = async (bookId, bookData) => {
  const { title, author, genre, publishDate, copies, price } = bookData;

  try {
    const data = await pool.query(`
      UPDATE books 
      SET 
        title = $1,
        author = $2,
        genre = $3,
        published_date = $4,
        total_copies = $5,
        available_copies = available_copies + ($5 - total_copies),
        price = $6
      WHERE book_id = $7
      RETURNING 
        book_id,
        title,
        author,
        genre,
        TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
        total_copies,
        available_copies,
        rating,
        price
    `, [title, author, genre, publishDate, copies, price, bookId]);

    return data.rows[0];

  } catch (error) {
    console.error('Error updating book in database:', error);
    throw error;
  }
}

export const borrowBook = async (bookId, customerId, copiesToBorrow) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check if book has enough available copies
    const bookCheck = await client.query(
      'SELECT available_copies, title FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      throw new Error('Book not found');
    }

    const availableCopies = bookCheck.rows[0].available_copies;

    if (availableCopies < copiesToBorrow) {
      throw new Error(`Not enough copies available. Only ${availableCopies} copies left.`);
    }

    // 2. Deduct the borrowed copies from available_copies
    await client.query(
      'UPDATE books SET available_copies = available_copies - $1 WHERE book_id = $2',
      [copiesToBorrow, bookId]
    );

    // add loan record with auto-generated dates 
    const loanResult = await client.query(`
      INSERT INTO loans (book_id, customer_id, loan_date, expected_return_date, copies_borrowed, status)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', $3, 'Borrowed')
      RETURNING 
        loan_id,
        book_id,
        customer_id,
        TO_CHAR(loan_date, 'Mon DD, YYYY') as loan_date,
        TO_CHAR(expected_return_date, 'Mon DD, YYYY') as expected_return_date,
        copies_borrowed,
        status
    `, [bookId, customerId, copiesToBorrow]);

    await client.query('COMMIT');
    return loanResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error borrowing book:', error);
    throw error;
  } finally {
    client.release();
  }
}

// get the borrowed books for a customer
export const getCustomerLoans = async (customerId) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.loan_id,
        l.book_id,
        b.title as book_title,
        b.author,
        b.genre,
        TO_CHAR(l.loan_date, 'Mon DD, YYYY') as loan_date,
        TO_CHAR(l.expected_return_date, 'Mon DD, YYYY') as expected_return_date,
        l.copies_borrowed,
        l.status,
        l.fine_amount
      FROM loans l
      JOIN books b ON l.book_id = b.book_id
      WHERE l.customer_id = $1
      ORDER BY l.loan_date DESC
    `, [customerId]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching customer loans:', error);
    throw error;
  }
}


// Get all loans for staff (Borrowing Activities)
export const getAllLoans = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        l.loan_id,
        l.book_id,
        b.title as book_title,
        b.author,
        c.first_name || ' ' || c.last_name as borrower_name,
        TO_CHAR(l.loan_date, 'Mon DD, YYYY') as loan_date,
        TO_CHAR(l.expected_return_date, 'Mon DD, YYYY') as expected_return_date,
        l.copies_borrowed,
        l.status,
        l.fine_amount,
        l.rating
      FROM loans l
      JOIN books b ON l.book_id = b.book_id
      JOIN customers c ON l.customer_id = c.customer_id
      ORDER BY l.loan_date DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error fetching all loans:', error);
    throw error;
  }
}

export const returnBook = async (loanId, bookId, rating = null, copiesBorrowed) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update loan status, return date, and rating in the loans table
    const loanResult = await client.query(`
      UPDATE loans 
      SET 
        status = 'Returned', 
        return_date = CURRENT_DATE,
        rating = $1
      WHERE loan_id = $2
      RETURNING 
        loan_id,
        TO_CHAR(return_date, 'Mon DD, YYYY') as return_date,
        status,
        rating
    `, [rating, loanId]);

    // Calculate and update average book rating from all returned loans with ratings
    if (rating !== null && rating > 0) {
      const avgRatingResult = await client.query(
        `SELECT AVG(rating) as avg_rating 
         FROM loans 
         WHERE book_id = $1 AND status = 'Returned' AND rating IS NOT NULL`,
        [bookId]
      );
      
      const avgRating = avgRatingResult.rows[0]?.avg_rating;
      
      if (avgRating) {
        await client.query(
          'UPDATE books SET rating = $1 WHERE book_id = $2',
          [parseFloat(avgRating).toFixed(1), bookId]
        );
      }
    }

    // Add the returned copies back to available_copies
    await client.query(
      'UPDATE books SET available_copies = available_copies + $1 WHERE book_id = $2',
      [copiesBorrowed, bookId]
    );

    await client.query('COMMIT');
    return loanResult.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error returning book:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Delete a book (only if not currently borrowed)
export const deleteBook = async (bookId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if book has any active (borrowed) loans
    const activeLoanCheck = await client.query(
      `SELECT COUNT(*) as active_loans 
       FROM loans 
       WHERE book_id = $1 AND status = 'Borrowed'`,
      [bookId]
    );

    const activeLoans = parseInt(activeLoanCheck.rows[0].active_loans);

    if (activeLoans > 0) {
      throw new Error('Cannot delete book. It is currently borrowed by customers.');
    }

    // Check if book exists
    const bookCheck = await client.query(
      'SELECT title FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      throw new Error('Book not found');
    }

    // Delete from favorites first (CASCADE will handle this, but being explicit)
    await client.query(
      'DELETE FROM favorites WHERE book_id = $1',
      [bookId]
    );

    // Delete returned loans history (optional - keep history)
    // await client.query(
    //   'DELETE FROM loans WHERE book_id = $1',
    //   [bookId]
    // );

    // Delete the book
    const result = await client.query(
      'DELETE FROM books WHERE book_id = $1 RETURNING book_id, title',
      [bookId]
    );

    await client.query('COMMIT');
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting book:', error);
    throw error;
  } finally {
    client.release();
  }
}

