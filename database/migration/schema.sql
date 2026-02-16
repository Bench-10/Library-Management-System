CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) ,
    published_date DATE,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,
    rating DECIMAL(2, 1),
    is_deleted BOOLEAN DEFAULT FALSE,
    borrow_limit INT DEFAULT 3,
    return_days INT NOT NULL DEFAULT 5

);


CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE

);


CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT

);

CREATE TABLE walk_in_customers (
    walk_in_customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(book_id) ON DELETE RESTRICT,
    customer_id INT REFERENCES customers(customer_id),
    walk_in_customer_id INT REFERENCES walk_in_customers(walk_in_customer_id),
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_return_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Borrowed',
    copies_borrowed INT NOT NULL DEFAULT 1,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    rating DECIMAL(2, 1) DEFAULT NULL,
    contact_number VARCHAR(20),
    loan_type VARCHAR(20) NOT NULL DEFAULT 'Online' CHECK (loan_type IN ('Online', 'Walk-in')),
    CONSTRAINT customer_constraint CHECK (
        (customer_id IS NOT NULL AND walk_in_customer_id IS NULL) OR 
        (customer_id IS NULL AND walk_in_customer_id IS NOT NULL)
    ),
    book_condition VARCHAR(50) DEFAULT NULL

);



CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id) ON DELETE CASCADE,
    book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
    added_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, book_id)
);
