import  * as booksServices from '../services/booksServices.js'



export const getAllBooks = async (req, res) => {
  try {
    const books = await booksServices.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
};


export const addNewBook = async (req, res) => {
  const bookData = req.body;
  try {
    const result = await booksServices.addNewBook(bookData);
    res.status(201).json({ message: "Book added successfully", data: result });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add new book",
    });
  }
}

export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const bookData = req.body;
  
  try {
    const result = await booksServices.updateBook(bookId, bookData);
    if (result) {
      res.status(200).json({ message: "Book updated successfully", data: result });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update book",
    });
  }
}

export const borrowBook = async (req, res) => {
  const { bookId, customerId, copiesToBorrow } = req.body;
  
  try {
    const result = await booksServices.borrowBook(bookId, customerId, copiesToBorrow);
    res.status(201).json({ 
      message: "Book borrowed successfully", 
      data: result 
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message || "Failed to borrow book",
    });
  }
}

export const getCustomerLoans = async (req, res) => {
  const customerId = req.params.customerId;
  
  try {
    const loans = await booksServices.getCustomerLoans(customerId);
    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch borrowed books",
    });
  }
}

// Get all loans for staff
export const getAllLoans = async (req, res) => {
  try {
    const loans = await booksServices.getAllLoans();
    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch all loans",
    });
  }
}

export const returnBook = async (req, res) => {
  const { loanId } = req.params;
  const { bookId, rating, copiesBorrowed } = req.body;

  try {
    const result = await booksServices.returnBook(loanId, bookId, rating, copiesBorrowed);
    res.status(200).json({ 
      message: "Book returned successfully", 
      data: result 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to return book",
    });
  }
}

export const deleteBook = async (req, res) => {
  const bookId = req.params.id;
  
  try {
    const result = await booksServices.deleteBook(bookId);
    res.status(200).json({ 
      message: "Book deleted successfully", 
      data: result 
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is about active loans
    if (error.message.includes('currently borrowed')) {
      res.status(400).json({
        message: error.message,
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to delete book",
      });
    }
  }
}
