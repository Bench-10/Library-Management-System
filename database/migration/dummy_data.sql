INSERT INTO books (title, author, genre, published_date, total_copies, available_copies, price, rating) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '1925-04-10', 10, 6, 299.99, 4.5),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '1960-07-11', 8, 3, 249.50, 4.8),
('1984', 'George Orwell', 'Dystopian', '1949-06-08', 12, 7, 199.00, 4.6),
('Pride and Prejudice', 'Jane Austen', 'Romance', '1813-01-28', 7, 2, 179.99, 4.4),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '1937-09-21', 15, 10, 349.00, 4.9),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', '1997-06-26', 20, 14, 399.00, 4.9),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', '1951-07-16', 6, 1, 219.99, 4.0),
('The Alchemist', 'Paulo Coelho', 'Philosophy', '1988-01-01', 9, 5, 199.99, 4.3),
('Atomic Habits', 'James Clear', 'Self-Help', '2018-10-16', 18, 12, 499.00, 4.7),
('Clean Code', 'Robert C. Martin', 'Programming', '2008-08-01', 5, 2, 899.99, 4.8);



INSERT INTO staff (email, password, first_name, last_name, is_admin) VALUES
('john_staff@gmail.com', 'pass123', 'John', 'Doe', FALSE),
('emma_staff@gmail.com', 'pass456', 'Emma', 'Smith', FALSE),
('admin_user@gmail.com', 'admin789', 'Alice', 'Admin', TRUE);



INSERT INTO customers (first_name, last_name, email, password, phone, address) VALUES
('Michael', 'Brown', 'michael.brown@email.com', 'cust123', '9876543210', '123 Main Street, NY'),
('Sarah', 'Johnson', 'sarah.johnson@email.com', 'cust456', '9123456780', '45 Park Avenue, CA'),
('David', 'Wilson', 'david.wilson@email.com', 'cust789', '9988776655', '78 Elm Road, TX');



INSERT INTO loans (book_id, customer_id, loan_date, return_date, status, fine_amount) VALUES
(1, 1, '2025-01-01', '2025-01-10', 'Returned', 0.00),
(2, 2, '2025-01-05', NULL, 'Borrowed', 0.00),
(3, 3, '2025-01-07', NULL, 'Borrowed', 0.00),
(4, 1, '2025-01-08', '2025-01-18', 'Returned', 10.00),
(5, 2, '2025-01-10', NULL, 'Borrowed', 0.00),
(6, 3, '2025-01-12', '2025-01-22', 'Returned', 0.00),
(7, 1, '2025-01-15', NULL, 'Borrowed', 5.00),
(8, 2, '2025-01-16', '2025-01-25', 'Returned', 0.00),
(9, 3, '2025-01-18', NULL, 'Borrowed', 0.00),
(10, 1, '2025-01-20', NULL, 'Borrowed', 0.00);