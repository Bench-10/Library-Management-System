import express from 'express'
import * as bookControllers from '../controllers/bookControllers.js';

const router = express.Router();

//Getting all the books
router.get("/books", bookControllers.getAllBooks);
router.post("/books", bookControllers.addNewBook);
router.put("/books/:id", bookControllers.updateBook);
router.delete("/books/:id", bookControllers.deleteBook);

// Borrow book
router.post("/borrow", bookControllers.borrowBook);

// Get customer's borrowed books
router.get("/loans/:customerId", bookControllers.getCustomerLoans);

// Get all loans (for staff - Borrowing Activities)
router.get("/loans", bookControllers.getAllLoans);

// Return book
router.put("/loans/return/:loanId", bookControllers.returnBook);



export default router;







