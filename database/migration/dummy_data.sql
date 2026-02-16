INSERT INTO books (title, author, genre, published_date, total_copies, available_copies, rating)
VALUES
('The Silent Patient', 'Alex Michaelides', 'Thriller', '2019-02-05', 10, 10, 4.5),
('Atomic Habits', 'James Clear', 'Self-help', '2018-10-16', 15, 15, 4.8),
('1984', 'George Orwell', 'Dystopian', '1949-06-08', 8, 8, 4.6),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '1937-09-21', 12, 12, 4.7),
('Dune', 'Frank Herbert', 'Sci-Fi', '1965-08-01', 10, 10, 4.4),
('The Alchemist', 'Paulo Coelho', 'Fiction', '1988-01-01', 14, 14, 4.2),
('Clean Code', 'Robert C. Martin', 'Programming', '2008-08-01', 6, 6, 4.9),
('Sapiens', 'Yuval Noah Harari', 'History', '2011-01-01', 9, 9, 4.7),
('Harry Potter 1', 'J.K. Rowling', 'Fantasy', '1997-06-26', 20, 20, 4.8),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Finance', '1997-04-01', 11, 11, 4.1);


INSERT INTO staff (email, password, first_name, last_name, is_admin)
VALUES
('admin@library.com', 'admin123', 'Alice', 'Admin', TRUE),
('john@library.com', 'john123', 'John', 'Doe', FALSE),
('mary@library.com', 'mary123', 'Mary', 'Smith', FALSE),
('peter@library.com', 'peter123', 'Peter', 'Brown', FALSE),
('lisa@library.com', 'lisa123', 'Lisa', 'White', FALSE);


INSERT INTO customers (first_name, last_name, email, password, phone, address)
VALUES
('Mark', 'Taylor', 'mark@mail.com', 'pass1', '0911111111', 'Manila'),
('Sarah', 'Connor', 'sarah@mail.com', 'pass2', '0922222222', 'Cebu'),
('David', 'Lee', 'david@mail.com', 'pass3', '0933333333', 'Davao'),
('Emma', 'Stone', 'emma@mail.com', 'pass4', '0944444444', 'Baguio'),
('Chris', 'Evans', 'chris@mail.com', 'pass5', '0955555555', 'Quezon City');


INSERT INTO walk_in_customers (first_name, last_name, phone, email, address)
VALUES
('Juan', 'Dela Cruz', '0900000001', NULL, 'Manila'),
('Ana', 'Reyes', '0900000002', NULL, 'Cavite'),
('Luis', 'Santos', '0900000003', NULL, 'Laguna'),
('Maria', 'Lopez', '0900000004', NULL, 'Batangas'),
('Jose', 'Ramos', '0900000005', NULL, 'Pampanga'),
('Paolo', 'Garcia', '0900000006', NULL, 'Bulacan'),
('Nina', 'Torres', '0900000007', NULL, 'Rizal'),
('Leo', 'Mendoza', '0900000008', NULL, 'Taguig'),
('Karla', 'Flores', '0900000009', NULL, 'Pasig'),
('Ryan', 'Lim', '0900000010', NULL, 'Makati');


INSERT INTO loans
(book_id, customer_id, walk_in_customer_id, expected_return_date, status, copies_borrowed, loan_type, contact_number)
VALUES
-- ONLINE LOANS
(1, 1, NULL, CURRENT_DATE + INTERVAL '7 days', 'Borrowed', 1, 'Online', '0911111111'),
(2, 2, NULL, CURRENT_DATE + INTERVAL '7 days', 'Borrowed', 1, 'Online', '0922222222'),
(3, 3, NULL, CURRENT_DATE + INTERVAL '7 days', 'Returned', 1, 'Online', '0933333333'),
(4, 4, NULL, CURRENT_DATE + INTERVAL '7 days', 'Borrowed', 1, 'Online', '0944444444'),
(5, 5, NULL, CURRENT_DATE + INTERVAL '7 days', 'Returned', 1, 'Online', '0955555555'),

-- WALK-IN LOANS
(6, NULL, 1, CURRENT_DATE + INTERVAL '5 days', 'Borrowed', 1, 'Walk-in', '0900000001'),
(7, NULL, 2, CURRENT_DATE + INTERVAL '5 days', 'Returned', 1, 'Walk-in', '0900000002'),
(8, NULL, 3, CURRENT_DATE + INTERVAL '5 days', 'Borrowed', 1, 'Walk-in', '0900000003'),
(9, NULL, 4, CURRENT_DATE + INTERVAL '5 days', 'Borrowed', 1, 'Walk-in', '0900000004'),
(10, NULL, 5, CURRENT_DATE + INTERVAL '5 days', 'Returned', 1, 'Walk-in', '0900000005');



INSERT INTO favorites (customer_id, book_id)
VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 5),
(3, 6),
(4, 7),
(4, 8),
(5, 9),
(5, 10);





