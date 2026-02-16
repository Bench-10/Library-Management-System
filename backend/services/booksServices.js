import pool  from "../db.js";

//Function to get all books from the database
export const getAllBooks = async () =>{    try {
      const result = await pool.query(`
        SELECT 
          book_id,
          title,
          author,
          genre,
          TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
          total_copies,
          available_copies,
          rating,
          borrow_limit,
          return_days
        FROM books
        WHERE
          is_deleted = FALSE
      `);
      const books = result.rows;
      return books;
    } catch (error) {
      console.error('Error fetching books from database:', error);
    }
  
}

// Get a single book by ID with deletion status check
export const getBookById = async (bookId) => {
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
        rating,
        is_deleted
      FROM books
      WHERE book_id = $1
    `, [bookId]);
    
    if (result.rows.length === 0) {
      throw new Error('Book not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching book from database:', error);
    throw error;
  }
}

export const addNewBook = async (bookData) => {
  const { title, author, genre, publishDate, copies, borrowLimit = 3, returnDays = 5 } = bookData;

  try {
    const data = await pool.query(`
      INSERT INTO books ( title, author, genre, published_date, total_copies, available_copies, borrow_limit, return_days)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING 
        book_id,
        title,
        author,
        genre,
        TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
        total_copies,
        available_copies,
        rating,
        borrow_limit,
        return_days
    `, [title, author, genre, publishDate, copies, copies, borrowLimit, returnDays]);

    return data.rows[0];

  } catch (error) {
    console.error('Error adding books from database:', error);
  }
}

export const updateBook = async (bookId, bookData) => {
  const { title, author, genre, publishDate, copies, borrowLimit = 3, returnDays = 5} = bookData;

  try {

    const result = await pool.query(
      'SELECT total_copies, available_copies FROM books WHERE book_id = $1',
      [bookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Book not found');
    }

    const { total_copies, available_copies } = result.rows[0];

    const borrowedCopies = total_copies - available_copies;
    const newAvailableCopies = copies - borrowedCopies;

    if (newAvailableCopies < 0) {
      throw new Error(
        'Cannot update book. There are more borrowed copies than the new total copies.'
      );
    }


    const data = await pool.query(`
      UPDATE books 
      SET 
        title = $1,
        author = $2,
        genre = $3,
        published_date = $4,
        total_copies = $5,
        available_copies = available_copies + ($5 - total_copies),
        borrow_limit = $7,
        return_days = $8
      WHERE book_id = $6
      RETURNING 
        book_id,
        title,
        author,
        genre,
        TO_CHAR(published_date, 'Mon dd YYYY') AS published_date,
        total_copies,
        available_copies,
        rating,
        borrow_limit,
        return_days
    `, [title, author, genre, publishDate, copies, bookId, borrowLimit, returnDays]);


    return data.rows[0];

  } catch (error) {
    console.error('Error updating book in database:', error);
    throw error;
  }
}

export const borrowBook = async (bookId, customerId, copiesToBorrow, mobileNumber = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check if book has enough available copies
    const bookCheck = await client.query(
      'SELECT available_copies, title, borrow_limit, return_days FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      throw new Error('Book not found');
    }

    const availableCopies = bookCheck.rows[0].available_copies;
    const returnDays = bookCheck.rows[0].return_days || 5; // Default to 5 days if not set

    if (availableCopies < copiesToBorrow) {
      throw new Error(`Not enough copies available. Only ${availableCopies} copies left.`);
    }

    if (copiesToBorrow > bookCheck.rows[0].borrow_limit) {
      throw new Error(`Cannot borrow more than ${bookCheck.rows[0].borrow_limit} copies of this book.`);
    }

    // 2. Deduct the borrowed copies from available_copies
    await client.query(
      'UPDATE books SET available_copies = available_copies - $1 WHERE book_id = $2',
      [copiesToBorrow, bookId]
    );

    // add loan record with auto-generated dates and contact number using book's return_days
    const loanResult = await client.query(`
      INSERT INTO loans (book_id, customer_id, loan_date, expected_return_date, copies_borrowed, status, contact_number)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day' * $3, $4, 'Borrowed', $5)
      RETURNING 
        loan_id,
        book_id,
        customer_id,
        TO_CHAR(loan_date, 'Mon DD, YYYY') as loan_date,
        TO_CHAR(expected_return_date, 'Mon DD, YYYY') as expected_return_date,
        copies_borrowed,
        status,
        contact_number
    `, [bookId, customerId, returnDays, copiesToBorrow, mobileNumber]);

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
        CASE 
          WHEN l.customer_id IS NOT NULL THEN c.first_name || ' ' || c.last_name
          WHEN l.walk_in_customer_id IS NOT NULL THEN wc.first_name || ' ' || wc.last_name
        END as borrower_name,
        TO_CHAR(l.loan_date, 'Mon DD, YYYY') as loan_date,
        TO_CHAR(l.expected_return_date, 'Mon DD, YYYY') as expected_return_date,
        l.copies_borrowed,
        l.status,
        l.fine_amount,
        l.book_condition,
        l.rating,
        l.loan_type,
        CASE 
          WHEN l.customer_id IS NOT NULL AND l.contact_number IS NOT NULL THEN l.contact_number
          WHEN l.customer_id IS NOT NULL AND l.contact_number IS NULL THEN c.phone
          WHEN l.walk_in_customer_id IS NOT NULL THEN wc.phone
        END as contact_number
        
      FROM loans l
      JOIN books b ON l.book_id = b.book_id
      LEFT JOIN customers c ON l.customer_id = c.customer_id
      LEFT JOIN walk_in_customers wc ON l.walk_in_customer_id = wc.walk_in_customer_id
      ORDER BY l.loan_date DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error fetching all loans:', error);
    throw error;
  }
}

export const returnBook = async (loanId, bookId, rating = null, copiesBorrowed, bookCondition = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update loan status, return date, rating, and book condition in the loans table
    const loanResult = await client.query(`
      UPDATE loans 
      SET 
        status = 'Returned', 
        return_date = CURRENT_DATE,
        rating = $1,
        book_condition = $3
      WHERE loan_id = $2
      RETURNING 
        loan_id,
        TO_CHAR(return_date, 'Mon DD, YYYY') as return_date,
        status,
        rating,
        book_condition
    `, [rating, loanId, bookCondition]);

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

// Check if a book is currently borrowed
export const checkBookBorrowStatus = async (bookId) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.title,
        b.book_id,
        COUNT(l.loan_id) as active_loans,
        ARRAY_AGG(
          CASE 
            WHEN l.status = 'Borrowed' 
            THEN c.first_name || ' ' || c.last_name 
            ELSE NULL 
          END
        ) FILTER (WHERE l.status = 'Borrowed') as borrower_names
       FROM books b
       LEFT JOIN loans l ON b.book_id = l.book_id AND l.status = 'Borrowed'
       LEFT JOIN customers c ON l.customer_id = c.customer_id
       WHERE b.book_id = $1 AND b.is_deleted = FALSE
       GROUP BY b.book_id, b.title`,
      [bookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Book not found');
    }

    const bookData = result.rows[0];
    return {
      book_id: bookData.book_id,
      title: bookData.title,
      is_borrowed: parseInt(bookData.active_loans) > 0,
      active_loans: parseInt(bookData.active_loans),
      borrower_names: bookData.borrower_names || []
    };

  } catch (error) {
    console.error('Error checking book borrow status:', error);
    throw error;
  }
}

// Walk-in borrowing services
export const createWalkInCustomer = async (customerData) => {
  const { firstName, lastName, phone, email, address } = customerData;
  
  try {
    const result = await pool.query(`
      INSERT INTO walk_in_customers (first_name, last_name, phone, email, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING walk_in_customer_id, first_name, last_name, phone, email
    `, [firstName, lastName, phone, email || null, address || null]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating walk-in customer:', error);
    throw error;
  }
}

export const createWalkInLoan = async (bookId, walkInCustomerId, copiesToBorrow) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if book exists and has enough copies
    const bookCheck = await client.query(
      'SELECT title, available_copies, borrow_limit, return_days FROM books WHERE book_id = $1 AND is_deleted = FALSE',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      throw new Error('Book not found or has been deleted');
    }

    const book = bookCheck.rows[0];
    const returnDays = book.return_days || 5; // Default to 5 days if not set
    
    if (book.available_copies < copiesToBorrow) {
      throw new Error(`Not enough copies available. Only ${book.available_copies} copies left.`);
    }

    if (copiesToBorrow > book.borrow_limit) {
      throw new Error(`Cannot borrow more than ${book.borrow_limit} copies of this book.`);
    }

    // Calculate expected return date using book's custom return_days
    const expectedReturnDate = new Date();
    expectedReturnDate.setDate(expectedReturnDate.getDate() + returnDays);

    // Create the loan
    const loanResult = await client.query(`
      INSERT INTO loans (book_id, walk_in_customer_id, expected_return_date, copies_borrowed, loan_type)
      VALUES ($1, $2, $3, $4, 'Walk-in')
      RETURNING loan_id, loan_date, expected_return_date
    `, [bookId, walkInCustomerId, expectedReturnDate, copiesToBorrow]);

    // Update available copies
    await client.query(
      'UPDATE books SET available_copies = available_copies - $1 WHERE book_id = $2',
      [copiesToBorrow, bookId]
    );

    await client.query('COMMIT');
    
    return {
      loan_id: loanResult.rows[0].loan_id,
      book_title: book.title,
      loan_date: loanResult.rows[0].loan_date,
      expected_return_date: loanResult.rows[0].expected_return_date,
      copies_borrowed: copiesToBorrow
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating walk-in loan:', error);
    throw error;
  } finally {
    client.release();
  }
}

export const processWalkInBorrowing = async (bookId, customerData, copiesToBorrow) => {
  try {
    // First create the walk-in customer
    const customer = await createWalkInCustomer(customerData);
    
    // Then create the loan
    const loan = await createWalkInLoan(bookId, customer.walk_in_customer_id, copiesToBorrow);
    
    return {
      loanId: loan.loan_id,
      customer: customer,
      loan: loan
    };
    
  } catch (error) {
    console.error('Error processing walk-in borrowing:', error);
    throw error;
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

    // Soft Delete the book
    const result = await client.query(
      'UPDATE books SET is_deleted = TRUE WHERE book_id = $1 RETURNING book_id, title',
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

