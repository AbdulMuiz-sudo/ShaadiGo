--DATABASE SETUP
CREATE DATABASE shaadigo_db;
GO

USE shaadigo_db;
GO

--1. users
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('customer','owner','admin')),
    created_at DATETIME DEFAULT GETDATE()
);

--2. venues
CREATE TABLE venues (
    venue_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    venue_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    town VARCHAR(100),
    capacity INT,
    price_per_event DECIMAL(10,2),
    description VARCHAR(1000),
    cancellation_policy VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

--3. venue_images
CREATE TABLE venue_images (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT NOT NULL,
    image_url VARCHAR(255),

    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

--4. terms_conditions
CREATE TABLE terms_conditions (
    terms_id INT IDENTITY(1,1) PRIMARY KEY,
    content VARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE()
);

--5. bookings
CREATE TABLE bookings (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    terms_id INT,
    event_date DATE NOT NULL,
    booking_status VARCHAR(20) CHECK (booking_status IN ('pending','confirmed','cancelled','completed')),
    advance_paid DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id),
    FOREIGN KEY (terms_id) REFERENCES terms_conditions(terms_id) ON DELETE SET NULL
);

--unique constraint
ALTER TABLE bookings
ADD CONSTRAINT uq_venue_date UNIQUE (venue_id, event_date);

--6. payments
CREATE TABLE payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid','pending','refunded')),
    payment_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

--7. refunds
CREATE TABLE refunds (
    refund_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    refund_amount DECIMAL(10,2),
    reason VARCHAR(255),
    refund_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

--8. reviews
CREATE TABLE reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

--9. messages
CREATE TABLE messages (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text VARCHAR(500),
    sent_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

--10. support_tickets
CREATE TABLE support_tickets (
    ticket_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(150),
    message VARCHAR(500),
    status VARCHAR(20) DEFAULT 'open',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

--11. decorations
CREATE TABLE decorations (
    decoration_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    decoration_name VARCHAR(150),
    description VARCHAR(300),
    price DECIMAL(10,2),

    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

--12. food_packages
CREATE TABLE food_packages (
    food_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    package_name VARCHAR(150),
    description VARCHAR(300),
    price_per_person DECIMAL(10,2),

    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE
);

--13. faqs
CREATE TABLE faqs (
    faq_id INT IDENTITY(1,1) PRIMARY KEY,
    venue_id INT,
    question VARCHAR(300) NOT NULL,
    answer VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE SET NULL
);

--14. cancelled_bookings
CREATE TABLE cancelled_bookings (
    cancel_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT,
    cancelled_by INT,
    cancel_reason VARCHAR(300),
    cancelled_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(user_id)
);

--INDEXES
CREATE INDEX idx_booking_date ON bookings(event_date);
CREATE INDEX idx_venue_location ON venues(location);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_venue ON bookings(venue_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

--VIEWS

CREATE VIEW vw_venue_details AS
SELECT v.venue_id, v.venue_name, v.city,
       AVG(ISNULL(r.rating,0)) AS avg_rating
FROM venues v
LEFT JOIN reviews r ON v.venue_id = r.venue_id
GROUP BY v.venue_id, v.venue_name, v.city;

CREATE VIEW vw_booking_details AS
SELECT b.booking_id, u.full_name, v.venue_name, b.event_date, b.booking_status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN venues v ON b.venue_id = v.venue_id;

CREATE VIEW vw_payment_history AS
SELECT p.payment_id, u.full_name, v.venue_name, p.amount, p.payment_status
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN users u ON b.user_id = u.user_id
JOIN venues v ON b.venue_id = v.venue_id;

--STORED PROCEDURES
GO

CREATE PROCEDURE sp_register_user
@name VARCHAR(100),
@email VARCHAR(150),
@pass VARCHAR(255),
@phone VARCHAR(20),
@role VARCHAR(20)
AS
INSERT INTO users(full_name,email,password_hash,phone,role)
VALUES(@name,@email,@pass,@phone,@role);
GO

CREATE PROCEDURE sp_login_user
@email VARCHAR(150),
@pass VARCHAR(255)
AS
SELECT * FROM users WHERE email=@email AND password_hash=@pass;
GO

CREATE PROCEDURE sp_create_booking
@uid INT,
@vid INT,
@terms INT,
@date DATE,
@advance DECIMAL(10,2)
AS
BEGIN
IF EXISTS (
    SELECT 1 FROM bookings 
    WHERE venue_id=@vid AND event_date=@date
)
BEGIN 
    PRINT 'Already booked'; 
    RETURN; 
END

INSERT INTO bookings(user_id,venue_id,terms_id,event_date,booking_status,advance_paid)
VALUES(@uid,@vid,@terms,@date,'pending',@advance);
END;
GO

CREATE PROCEDURE sp_cancel_booking
@bid INT,
@uid INT,
@reason VARCHAR(300)
AS
BEGIN
UPDATE bookings SET booking_status='cancelled' WHERE booking_id=@bid;

INSERT INTO cancelled_bookings(booking_id,cancelled_by,cancel_reason)
VALUES(@bid,@uid,@reason);
END;
GO

--FUNCTIONAL QUERIES (1–34)
/* 1 */
INSERT INTO users (full_name,email,password_hash,phone,role,created_at)
VALUES ('Ali Khan','ali@gmail.com','hashedpassword','03001234567','customer',GETDATE());

/* 2 */
SELECT * FROM users 
WHERE email='ali@gmail.com' AND password_hash='hashedpassword';

/* 3 */
SELECT venue_id, venue_name, city, town, capacity, price_per_event 
FROM venues;

/* 4 */
SELECT * FROM venues 
WHERE city='Karachi';

/* 5 */
SELECT * FROM venues 
WHERE price_per_event BETWEEN 200000 AND 500000;

/* 6 */
SELECT * FROM venues 
WHERE capacity >= 500;

/* 7 */
SELECT * FROM venues 
ORDER BY price_per_event ASC;

/* 8 */
SELECT * FROM venues 
ORDER BY price_per_event DESC;

/* 9 */
SELECT v.venue_id, v.venue_name, AVG(r.rating) AS average_rating
FROM venues v 
JOIN reviews r ON v.venue_id = r.venue_id
GROUP BY v.venue_id, v.venue_name
ORDER BY average_rating DESC;

/* 10 */
SELECT * FROM bookings 
WHERE venue_id = 1 AND event_date = '2026-12-15';

/* 11 */
INSERT INTO bookings (user_id, venue_id, terms_id, event_date, booking_status, advance_paid)
VALUES (1, 2, 1, '2026-12-15', 'pending', 50000);

/* 12 */
SELECT b.booking_id, v.venue_name, b.event_date, b.booking_status
FROM bookings b 
JOIN venues v ON b.venue_id = v.venue_id 
WHERE b.user_id = 1;

/* 13 */
UPDATE bookings 
SET booking_status='confirmed' 
WHERE booking_id=1;

/* 14 */
UPDATE bookings 
SET booking_status='cancelled' 
WHERE booking_id=1;

/* 15 */
INSERT INTO cancelled_bookings (booking_id,cancelled_by,cancel_reason,cancelled_at)
VALUES (1,1,'Event postponed',GETDATE());

/* 16 */
INSERT INTO payments (booking_id,amount,payment_method,payment_status,payment_date)
VALUES (1,50000,'Credit Card','paid',GETDATE());

/* 17 */
INSERT INTO refunds (booking_id,refund_amount,reason,refund_date)
VALUES (1,50000,'Booking cancelled',GETDATE());

/* 18 */
INSERT INTO reviews (user_id,venue_id,rating,comment,created_at)
VALUES (1,2,5,'Amazing venue',GETDATE());

/* 19 */
SELECT u.full_name, r.rating, r.comment
FROM reviews r 
JOIN users u ON r.user_id = u.user_id 
WHERE r.venue_id = 2;

/* 20 */
INSERT INTO messages (sender_id,receiver_id,message_text,sent_at)
VALUES (1,2,'Is venue available?',GETDATE());

/* 21 */
SELECT * FROM messages
WHERE (sender_id=1 AND receiver_id=2) 
   OR (sender_id=2 AND receiver_id=1)
ORDER BY sent_at;

/* 22 */
SELECT * FROM decorations 
WHERE venue_id=2;

/* 23 */
SELECT * FROM food_packages 
WHERE venue_id=2;

/* 24 */
SELECT question, answer 
FROM faqs 
WHERE venue_id=2;

/* 25 */
INSERT INTO support_tickets (user_id,subject,message,status,created_at)
VALUES (1,'Payment Issue','Problem','open',GETDATE());

/* 26 */
SELECT b.booking_id,u.full_name,v.venue_name,b.event_date,b.booking_status
FROM bookings b 
JOIN users u ON b.user_id=u.user_id
JOIN venues v ON b.venue_id=v.venue_id;

/* 27 */
SELECT v.venue_name, COUNT(b.booking_id) AS total_bookings
FROM venues v 
JOIN bookings b ON v.venue_id=b.venue_id
GROUP BY v.venue_name 
ORDER BY total_bookings DESC;

/* 28 */
SELECT MONTH(event_date) AS month, COUNT(*) AS total_bookings
FROM bookings 
GROUP BY MONTH(event_date);

/* 29 */
SELECT image_url 
FROM venue_images 
WHERE venue_id=2;

/* 30 */
SELECT v.venue_name, i.image_url
FROM venues v 
JOIN venue_images i ON v.venue_id=i.venue_id 
WHERE v.venue_id=2;

/* 31 */
SELECT b.booking_id, v.venue_name, b.event_date
FROM bookings b 
JOIN venues v ON b.venue_id=v.venue_id
WHERE b.booking_status='confirmed'
AND b.event_date >= CAST(GETDATE() AS DATE);

/* 32 */
SELECT event_date 
FROM bookings 
WHERE venue_id=2 AND booking_status='confirmed';

/* 33 */
SELECT * FROM bookings 
WHERE venue_id=2 AND event_date='2026-12-20';

/* 34 */
SELECT p.payment_id, p.amount, p.payment_status, b.event_date
FROM payments p 
JOIN bookings b ON p.booking_id=b.booking_id
WHERE b.user_id=1;