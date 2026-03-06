USE travel_booking_system;

-- ---------------------------------
-- USERS (5 rows)
-- ---------------------------------
INSERT INTO users (email, role, first_name, last_name, passport, address, telephone, password) VALUES
('admin@test.com', 'ADMIN', 'Alice', 'Admin', 'A1234567', '10 Admin Street, London', 447900000001, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('traveller@test.com', 'TRAVELLER', 'Tom', 'Walker', 'B2345678', '22 Baker Street, London', 447900000002, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('agent@test.com', 'TRAVEL_AGENT', 'Sarah', 'Connor', 'C3456789', '45 Agency Road, Manchester', 447900000003, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('traveller2@test.com', 'TRAVELLER', 'John', 'Smith', 'D4567890', '78 King Street, Birmingham', 447900000004, '$$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W'),
('agent2@test.com', 'TRAVEL_AGENT', 'Emma', 'Brown', 'E5678901', '12 Market Street, Leeds', 447900000005, '$2b$10$WlSpnbLMhWJgJvGqWiPOyOWkRVremYqKu5/IisUabdMg8/6mxHW/W');


-- ---------------------------------
-- PACKAGES (5 rows)
-- ---------------------------------
INSERT INTO packages (title, destination, start_date, end_date, description, price) VALUES
('Paris City Escape', 'Paris, France', '2026-06-01', '2026-06-05', 'Explore Paris landmarks and culture', 899.99),
('Rome Historical Tour', 'Rome, Italy', '2026-07-10', '2026-07-15', 'Discover ancient Roman history', 1099.50),
('Tokyo Adventure', 'Tokyo, Japan', '2026-09-01', '2026-09-10', 'Experience modern and traditional Japan', 1999.99),
('New York Highlights', 'New York, USA', '2026-08-05', '2026-08-09', 'Visit famous attractions in NYC', 1299.00),
('Dubai Luxury Trip', 'Dubai, UAE', '2026-11-12', '2026-11-18', 'Luxury travel and desert safari', 1799.75);


-- ---------------------------------
-- ITINERARY ITEMS (5 rows)
-- ---------------------------------
INSERT INTO itinerary_items (title, description, package_id) VALUES
('Eiffel Tower Visit', 'Guided tour of the Eiffel Tower', 1),
('Colosseum Tour', 'Visit the Colosseum and Roman Forum', 2),
('Shibuya Crossing', 'Explore the famous Shibuya district', 3),
('Statue of Liberty', 'Boat trip to Statue of Liberty', 4),
('Desert Safari', 'Evening desert safari with dinner', 5);


-- ---------------------------------
-- BOOKINGS (5 rows)
-- ---------------------------------
INSERT INTO bookings (user_id, package_id, packsize, additional_notes, total_price, status) VALUES
(2, 1, 2, 'Honeymoon trip', 1799.98, 'CONFIRMED'),
(2, 3, 1, 'Solo travel', 1999.99, 'PENDING'),
(4, 2, 3, 'Family vacation', 3298.50, 'CONFIRMED'),
(4, 4, 2, 'Anniversary celebration', 2598.00, 'COMPLETED'),
(2, 5, 4, 'Group booking', 7199.00, 'PENDING');
