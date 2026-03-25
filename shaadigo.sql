
--DATABASE SETUP
CREATE DATABASE ShaadiGoDB;
GO

USE ShaadiGoDB;
GO
--1. USERS
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('customer','owner','admin')),
    created_at DATETIME DEFAULT GETDATE()
);
--2. VENUES
CREATE TABLE Venues (
    venue_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    venue_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    town VARCHAR(100),
    capacity INT,
    price_per_event DECIMAL(10,2),
    description TEXT,
    cancellation_policy VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE VenueImages (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE TermsConditions (
    terms_id INT IDENTITY(1,1) PRIMARY KEY,
    content TEXT,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Bookings (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    terms_id INT,
    event_date DATE NOT NULL,
    booking_status VARCHAR(20) CHECK (booking_status IN ('pending','confirmed','cancelled','completed')),
    advance_paid DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id),
    FOREIGN KEY (terms_id) REFERENCES TermsConditions(terms_id) ON DELETE SET NULL
);

ALTER TABLE Bookings
ADD CONSTRAINT UQ_VenueDate UNIQUE (venue_id, event_date);

CREATE TABLE Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid','pending','refunded')),
    payment_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

CREATE TABLE Refunds (
    refund_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    refund_amount DECIMAL(10,2),
    reason VARCHAR(255),
    refund_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

CREATE TABLE Reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
);
CREATE TABLE Messages (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text VARCHAR(500),
    sent_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);

CREATE TABLE SupportTickets (
    ticket_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(150),
    message VARCHAR(500),
    status VARCHAR(20) DEFAULT 'open',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Decorations (
    decoration_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    decoration_name VARCHAR(150),
    description VARCHAR(300),
    price DECIMAL(10,2),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE FoodPackages (
    food_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    package_name VARCHAR(150),
    description VARCHAR(300),
    price_per_person DECIMAL(10,2),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE CASCADE
);

CREATE TABLE FAQs (
    faq_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    question VARCHAR(300) NOT NULL,
    answer VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE SET NULL
);

CREATE TABLE CancelledBookings (
    cancel_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT,
    cancelled_by INT,
    cancel_reason VARCHAR(300),
    cancelled_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES Users(user_id)
);

--INDEXES
CREATE INDEX idx_booking_date ON Bookings(event_date);
CREATE INDEX idx_venue_location ON Venues(location);
CREATE INDEX idx_reviews_rating ON Reviews(rating);
CREATE INDEX idx_bookings_user ON Bookings(user_id);
CREATE INDEX idx_bookings_venue ON Bookings(venue_id);
CREATE INDEX idx_messages_sender ON Messages(sender_id);

--VIEWS

CREATE VIEW vwVenueDetails AS
SELECT V.venue_id, V.venue_name, V.city,
       AVG(ISNULL(R.rating,0)) AS avg_rating
FROM Venues V
LEFT JOIN Reviews R ON V.venue_id = R.venue_id
GROUP BY V.venue_id, V.venue_name, V.city;

CREATE VIEW vwBookingDetails AS
SELECT B.booking_id, U.full_name, V.venue_name, B.event_date, B.booking_status
FROM Bookings B
JOIN Users U ON B.user_id = U.user_id
JOIN Venues V ON B.venue_id = V.venue_id;

CREATE VIEW vwPaymentHistory AS
SELECT P.payment_id, U.full_name, V.venue_name, P.amount, P.payment_status
FROM Payments P
JOIN Bookings B ON P.booking_id = B.booking_id
JOIN Users U ON B.user_id = U.user_id
JOIN Venues V ON B.venue_id = V.venue_id;

--STORED PROCEDURES
GO
CREATE PROCEDURE spRegisterUser
@name VARCHAR(100),
@email VARCHAR(150),
@pass VARCHAR(255),
@phone VARCHAR(20),
@role VARCHAR(20)
AS
INSERT INTO Users(full_name,email,password_hash,phone,role)
VALUES(@name,@email,@pass,@phone,@role);
GO

CREATE PROCEDURE spLoginUser
@email VARCHAR(150),
@pass VARCHAR(255)
AS
SELECT * FROM Users WHERE email=@email AND password_hash=@pass;
GO

CREATE PROCEDURE spCreateBooking
@uid INT,
@vid INT,
@terms INT,
@date DATE,
@advance DECIMAL(10,2)
AS
BEGIN
IF EXISTS (
    SELECT 1 FROM Bookings 
    WHERE venue_id=@vid AND event_date=@date
)
BEGIN 
    PRINT 'Already booked'; 
    RETURN; 
END

INSERT INTO Bookings(user_id,venue_id,terms_id,event_date,booking_status,advance_paid)
VALUES(@uid,@vid,@terms,@date,'pending',@advance);
END;
GO

CREATE PROCEDURE spCancelBooking
@bid INT,
@uid INT,
@reason VARCHAR(300)
AS
BEGIN
UPDATE Bookings SET booking_status='cancelled' WHERE booking_id=@bid;

INSERT INTO CancelledBookings(booking_id,cancelled_by,cancel_reason)
VALUES(@bid,@uid,@reason);
END;
GO

--FUNCTIONAL QUERIES (1–34)

/* 1 */ INSERT INTO Users VALUES ('Ali Khan','ali@gmail.com','hashedpassword','03001234567','customer',GETDATE());

/* 2 */ SELECT * FROM Users WHERE email='ali@gmail.com' AND password_hash='hashedpassword';

/* 3 */ SELECT venue_id, venue_name, city, town, capacity, price_per_event FROM Venues;

/* 4 */ SELECT * FROM Venues WHERE city='Karachi';

/* 5 */ SELECT * FROM Venues WHERE price_per_event BETWEEN 200000 AND 500000;

/* 6 */ SELECT * FROM Venues WHERE capacity >= 500;

/* 7 */ SELECT * FROM Venues ORDER BY price_per_event ASC;

/* 8 */ SELECT * FROM Venues ORDER BY price_per_event DESC;

/* 9 */ SELECT V.venue_id, V.venue_name, AVG(R.rating) AS average_rating
        FROM Venues V JOIN Reviews R ON V.venue_id = R.venue_id
        GROUP BY V.venue_id, V.venue_name
        ORDER BY average_rating DESC;

/* 10 */ SELECT * FROM Bookings WHERE venue_id = 1 AND event_date = '2026-12-15';

/* 11 */ INSERT INTO Bookings (user_id, venue_id, terms_id, event_date, booking_status, advance_paid)
        VALUES (1, 2, 1, '2026-12-15', 'pending', 50000);

/* 12 */ SELECT B.booking_id, V.venue_name, B.event_date, B.booking_status
        FROM Bookings B JOIN Venues V ON B.venue_id = V.venue_id WHERE B.user_id = 1;

/* 13 */ UPDATE Bookings SET booking_status='confirmed' WHERE booking_id=1;

/* 14 */ UPDATE Bookings SET booking_status='cancelled' WHERE booking_id=1;

/* 15 */ INSERT INTO CancelledBookings VALUES (1,1,'Event postponed',GETDATE());

/* 16 */ INSERT INTO Payments VALUES (1,50000,'Credit Card','paid',GETDATE());

/* 17 */ INSERT INTO Refunds VALUES (1,50000,'Booking cancelled',GETDATE());

/* 18 */ INSERT INTO Reviews VALUES (1,2,5,'Amazing venue',GETDATE());

/* 19 */ SELECT U.full_name, R.rating, R.comment
        FROM Reviews R JOIN Users U ON R.user_id = U.user_id WHERE R.venue_id = 2;

/* 20 */ INSERT INTO Messages VALUES (1,2,'Is venue available?',GETDATE());

/* 21 */ SELECT * FROM Messages
        WHERE (sender_id=1 AND receiver_id=2) OR (sender_id=2 AND receiver_id=1)
        ORDER BY sent_at;

/* 22 */ SELECT * FROM Decorations WHERE venue_id=2;

/* 23 */ SELECT * FROM FoodPackages WHERE venue_id=2;

/* 24 */ SELECT question, answer FROM FAQs WHERE venue_id=2;

/* 25 */ INSERT INTO SupportTickets VALUES (1,'Payment Issue','Problem','open',GETDATE());

/* 26 */ SELECT B.booking_id,U.full_name,V.venue_name,B.event_date,B.booking_status
        FROM Bookings B JOIN Users U ON B.user_id=U.user_id
        JOIN Venues V ON B.venue_id=V.venue_id;

/* 27 */ SELECT V.venue_name, COUNT(B.booking_id)
        FROM Venues V JOIN Bookings B ON V.venue_id=B.venue_id
        GROUP BY V.venue_name ORDER BY COUNT(B.booking_id) DESC;

/* 28 */ SELECT MONTH(event_date), COUNT(*) FROM Bookings GROUP BY MONTH(event_date);

/* 29 */ SELECT image_url FROM VenueImages WHERE venue_id=2;

/* 30 */ SELECT V.venue_name, I.image_url
        FROM Venues V JOIN VenueImages I ON V.venue_id=I.venue_id WHERE V.venue_id=2;

/* 31 */ SELECT B.booking_id, V.venue_name, B.event_date
        FROM Bookings B JOIN Venues V ON B.venue_id=V.venue_id
        WHERE B.booking_status='confirmed'
        AND B.event_date >= CAST(GETDATE() AS DATE);

/* 32 */ SELECT event_date FROM Bookings WHERE venue_id=2 AND booking_status='confirmed';

/* 33 */ SELECT * FROM Bookings WHERE venue_id=2 AND event_date='2026-12-20';

/* 34 */ SELECT P.payment_id, P.amount, P.payment_status, B.event_date
        FROM Payments P JOIN Bookings B ON P.booking_id=B.booking_id
        WHERE B.user_id=1;