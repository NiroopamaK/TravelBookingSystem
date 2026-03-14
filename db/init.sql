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
    user_id INT(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    created_on DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(250) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (package_id),
    FOREIGN KEY (user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
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
    created_on DATE NOT NULL,
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


-- USERS
INSERT INTO users (email, role, first_name, last_name, passport, address, telephone, password) VALUES
('admin@test.com', 'ADMIN', 'Alice', 'Admin', 'A1234567', '10 Admin Street, London', 447900000001, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('traveller@test.com', 'TRAVELLER', 'Tom', 'Walker', 'B2345678', '22 Baker Street, London', 447900000002, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('agent@test.com', 'TRAVEL_AGENT', 'Sarah', 'Connor', 'C3456789', '45 Agency Road, Manchester', 447900000003, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('traveller2@test.com', 'TRAVELLER', 'Emma', 'Stone', 'D4567890', '55 Oxford Street, London', 447900000004, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('agent2@test.com', 'TRAVEL_AGENT', 'Michael', 'Brown', 'E5678901', '88 Market Road, Birmingham', 447900000005, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W');


-- PACKAGES (8 rows) with created_on **after description**
INSERT INTO packages (user_id, title, destination, start_date, end_date, description, created_on, price) VALUES
(3, 'Paris City Escape', 'Paris, France', '2026-06-01', '2026-06-05', 'Explore Paris landmarks and culture', '2026-03-01', 899.99),
(3, 'Rome Historical Tour', 'Rome, Italy', '2026-07-10', '2026-07-15', 'Discover ancient Roman history', '2026-03-05', 1099.50),
(3, 'Tokyo Adventure', 'Tokyo, Japan', '2026-09-01', '2026-09-10', 'Experience modern and traditional Japan', '2026-03-08', 1999.99),
(3, 'New York Highlights', 'New York, USA', '2026-08-05', '2026-08-09', 'Visit famous attractions in NYC', '2026-03-10', 1299.00),
(5, 'Dubai Luxury Trip', 'Dubai, UAE', '2026-11-12', '2026-11-18', 'Luxury travel and desert safari', '2026-03-12', 1799.75),
(5, 'Sydney Explorer', 'Sydney, Australia', '2026-10-02', '2026-10-08', 'Opera House, beaches and city tours', '2026-03-15', 2100.00),
(5, 'Barcelona Beach Holiday', 'Barcelona, Spain', '2026-07-20', '2026-07-25', 'Relax on beaches and explore culture', '2026-03-18', 950.00),
(3, 'Swiss Alps Adventure', 'Zurich, Switzerland', '2026-12-05', '2026-12-12', 'Skiing and alpine sightseeing', '2026-03-20', 2200.00);


-- ITINERARY ITEMS
INSERT INTO itinerary_items (title, description, package_id) VALUES
('Eiffel Tower Visit', 'Guided tour of the Eiffel Tower', 1),
('Colosseum Tour', 'Visit the Colosseum and Roman Forum', 2),
('Shibuya Crossing', 'Explore the famous Shibuya district', 3),
('Statue of Liberty', 'Boat trip to Statue of Liberty', 4),
('Desert Safari', 'Evening desert safari with dinner', 5),
('Sydney Opera House', 'Guided Opera House visit', 6),
('La Sagrada Familia', 'Tour of Gaudi’s famous basilica', 7),
('Swiss Ski Resort', 'Ski experience in the Swiss Alps', 8);


-- BOOKINGS (10 rows)
INSERT INTO bookings (user_id, package_id, packsize, additional_notes, created_on, total_price, status) VALUES
(2, 1, 2, 'Honeymoon trip', '2026-03-05', 1799.98, 'CONFIRMED'),
(2, 3, 1, 'Solo travel', '2026-03-10', 1999.99, 'PENDING'),
(2, 5, 4, 'Group booking', '2026-02-18', 7199.00, 'PENDING'),
(2, 2, 2, 'Friends trip', '2026-03-12', 2199.00, 'CONFIRMED'),
(4, 4, 2, 'Anniversary celebration', '2026-02-25', 2598.00, 'COMPLETED'),
(4, 6, 1, 'Solo adventure', '2026-03-02', 2100.00, 'CONFIRMED'),
(4, 7, 3, 'Family beach holiday', '2026-02-15', 2850.00, 'PENDING'),
(4, 8, 2, 'Winter ski holiday', '2026-03-08', 4400.00, 'CONFIRMED'),
(2, 6, 2, 'Couple travel', '2026-02-28', 4200.00, 'PENDING'),
(4, 1, 1, 'Short getaway', '2026-03-14', 899.99, 'CONFIRMED');
