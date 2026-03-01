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
