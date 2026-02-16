import express from 'express'
import * as bookControllers from '../controllers/bookControllers.js';
import { verifyToken } from "../middleware/authController.js";
import { authorize } from "../middleware/roleBaseAccessController.js";
import { readRateLimiter, writeRateLimiter } from "../middleware/rateLimiter.js";
import { 
  validateNumericId, 
  validateString, 
  validateNumericRange,
  validateDate,
  validatePhone 
} from "../middleware/inputValidator.js";

const router = express.Router();

//Getting all the books
router.get("/books",  readRateLimiter, bookControllers.getAllBooks);
router.get("/books/:id", readRateLimiter, validateNumericId('id'), bookControllers.getBookById);

//Adding, updating, deleting books (for admin)
router.post("/books", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']),
  validateString('title', 255, null, true),
  validateString('author', 100, null, true),
  validateString('genre', 50, null, true),
  validateDate('publishDate', true),
  validateNumericRange('copies', 1, 10000, true),
  validateNumericRange('borrowLimit', 1, 10),
  validateNumericRange('returnDays', 1, 30),
  bookControllers.addNewBook
);

router.put("/books/:id", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']),
  validateNumericId('id'),
  validateString('title', 255, null, true),
  validateString('author', 100, null, true),
  validateString('genre', 50, null, true),
  validateDate('publishDate', true),
  validateNumericRange('copies', 1, 10000, true),
  validateNumericRange('borrowLimit', 1, 10),
  validateNumericRange('returnDays', 1, 30),
  bookControllers.updateBook
);

router.delete("/books/:id", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin']), 
  validateNumericId('id'),
  bookControllers.deleteBook
);

// Walk-in borrowing
router.post("/walk-in-borrow", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin','staff']),
  validateNumericId('bookId'),
  validateNumericRange('copiesToBorrow', 1, 100, true),
  validatePhone(true),
  bookControllers.processWalkInBorrowing
);

// Borrow book
router.get("/books/:id/status", 
  readRateLimiter, 
  validateNumericId('id'),
  bookControllers.checkBookBorrowStatus
);

router.post("/borrow", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['customer']),
  validateNumericId('bookId'),
  validateNumericId('customerId'),
  validateNumericRange('copiesToBorrow', 1, 100, true),
  bookControllers.borrowBook
);

// Get all loans (for staff and admin - Borrowing Activities)
router.get("/loans", 
  readRateLimiter, 
  verifyToken, 
  authorize(['admin', 'staff']), 
  bookControllers.getAllLoans
);

// Get customer's borrowed books
router.get("/loans/:customerId", 
  readRateLimiter, 
  verifyToken, 
  authorize(['customer']),
  validateNumericId('customerId'),
  bookControllers.getCustomerLoans
);

// Return book
router.put("/loans/return/:loanId", 
  writeRateLimiter, 
  verifyToken, 
  authorize(['admin', 'staff']),
  validateNumericId('loanId'),
  validateNumericId('bookId'),
  validateNumericRange('rating', 1, 5),
  validateNumericRange('copiesBorrowed', 1, 100, true),
  bookControllers.returnBook
);



export default router;







