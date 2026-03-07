USE travel_booking_system;

-- USER TABLE
CREATE TABLE users (
    user_id INT(10) NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'TRAVELLER', 'TRAVEL_AGENT') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    address VARCHAR(250) NOT NULL,
    telephone BIGINT NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;


-- PACKAGE TABLE
CREATE TABLE packages (
    package_id INT(10) NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(250) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (package_id)
) ENGINE=InnoDB;


-- ITINERARY ITEMS TABLE
CREATE TABLE itinerary_items (
    ii_id INT(10) NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(250) NOT NULL,
    package_id INT(10) NOT NULL,
    PRIMARY KEY (ii_id),
    FOREIGN KEY (package_id) 
        REFERENCES packages(package_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- BOOKING TABLE
CREATE TABLE bookings (
    booking_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id INT(10) NOT NULL,
    package_id INT(10) NOT NULL,
    packsize INT(4) NOT NULL,
    additional_notes VARCHAR(250),
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL,
    PRIMARY KEY (booking_id),
    FOREIGN KEY (package_id) 
        REFERENCES packages(package_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Insert Data
-- USERS 
INSERT INTO users (email, role, first_name, last_name, passport, address, telephone, password) VALUES
('admin@test.com', 'ADMIN', 'Alice', 'Admin', 'A1234567', '10 Admin Street, London', 447900000001, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('traveller@test.com', 'TRAVELLER', 'Tom', 'Walker', 'B2345678', '22 Baker Street, London', 447900000002, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('agent@test.com', 'TRAVEL_AGENT', 'Sarah', 'Connor', 'C3456789', '45 Agency Road, Manchester', 447900000003, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W');

-- PACKAGES (5 rows)
INSERT INTO packages (title, destination, start_date, end_date, description, price) VALUES
('Paris City Escape', 'Paris, France', '2026-06-01', '2026-06-05', 'Explore Paris landmarks and culture', 899.99),
('Rome Historical Tour', 'Rome, Italy', '2026-07-10', '2026-07-15', 'Discover ancient Roman history', 1099.50),
('Tokyo Adventure', 'Tokyo, Japan', '2026-09-01', '2026-09-10', 'Experience modern and traditional Japan', 1999.99),
('New York Highlights', 'New York, USA', '2026-08-05', '2026-08-09', 'Visit famous attractions in NYC', 1299.00),
('Dubai Luxury Trip', 'Dubai, UAE', '2026-11-12', '2026-11-18', 'Luxury travel and desert safari', 1799.75);

-- ITINERARY ITEMS
INSERT INTO itinerary_items (title, description, package_id) VALUES
('Eiffel Tower Visit', 'Guided tour of the Eiffel Tower', 1),
('Colosseum Tour', 'Visit the Colosseum and Roman Forum', 2),
('Shibuya Crossing', 'Explore the famous Shibuya district', 3),
('Statue of Liberty', 'Boat trip to Statue of Liberty', 4),
('Desert Safari', 'Evening desert safari with dinner', 5);

-- BOOKINGS
INSERT INTO bookings (user_id, package_id, packsize, additional_notes, total_price, status) VALUES
(2, 1, 2, 'Honeymoon trip', 1799.98, 'CONFIRMED'),
(2, 3, 1, 'Solo travel', 1999.99, 'PENDING'),
(3, 2, 3, 'Family vacation', 3298.50, 'CONFIRMED'),
(3, 4, 2, 'Anniversary celebration', 2598.00, 'COMPLETED'),
(2, 5, 4, 'Group booking', 7199.00, 'PENDING');
