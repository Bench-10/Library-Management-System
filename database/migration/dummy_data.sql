INSERT INTO books (title, author, genre, published_date, total_copies, available_copies, rating, is_deleted, borrow_limit, return_days)
VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '1925-04-10', 5, 5, 4.8, FALSE, 3, 5),
('Clean Code', 'Robert C. Martin', 'Technology', '2008-08-01', 10, 8, 4.9, FALSE, 2, 7),
('1984', 'George Orwell', 'Dystopian', '1949-06-08', 8, 0, 4.7, FALSE, 3, 5),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '1937-09-21', 12, 12, 4.9, FALSE, 3, 14),
('Introduction to Algorithms', 'Thomas H. Cormen', 'Education', '2009-07-31', 4, 4, 4.6, FALSE, 1, 3),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', '1997-06-26', 20, 15, 4.8, FALSE, 3, 7),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', '2011-09-04', 6, 2, 4.5, FALSE, 3, 10),
('Dune', 'Frank Herbert', 'Sci-Fi', '1965-08-01', 7, 7, 4.7, FALSE, 3, 7),
('The Pragmatic Programmer', 'Andy Hunt', 'Technology', '1999-10-30', 5, 1, 4.8, FALSE, 2, 7),
('Python Crash Course', 'Eric Matthes', 'Technology', '2015-11-01', 8, 8, 4.9, FALSE, 3, 5);


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







