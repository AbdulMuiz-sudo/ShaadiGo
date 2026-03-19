CREATE DATABASE ShaadiGoDB;

USE ShaadiGoDB;


/* ==============================
   1. USERS
================================= */
CREATE TABLE Users (
    user_id       INT           IDENTITY(1,1) PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20)   CHECK (role IN ('customer','owner','admin')),
    created_at    DATETIME      DEFAULT GETDATE()
);


/* ==============================
   2. VENUES
================================= */
CREATE TABLE Venues (
    venue_id            INT            IDENTITY(1,1) PRIMARY KEY,
    owner_id            INT            NOT NULL,
    venue_name          VARCHAR(150)   NOT NULL,
    location            VARCHAR(200)   NOT NULL,
    city                VARCHAR(100),
    town                VARCHAR(100),
    capacity            INT,
    price_per_event     DECIMAL(10,2),
    description         TEXT,
    cancellation_policy VARCHAR(500),
    created_at          DATETIME       DEFAULT GETDATE(),

    CONSTRAINT FK_Venues_Owner
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);


/* ==============================
   3. VENUE IMAGES
================================= */
CREATE TABLE VenueImages (
    image_id  INT          IDENTITY(1,1) PRIMARY KEY,
    venue_id  INT          NOT NULL,
    image_url VARCHAR(255),

    CONSTRAINT FK_VenueImages_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
        ON DELETE CASCADE
);


/* ==============================
   4. TERMS & CONDITIONS
   (before Bookings — FK dependency)
================================= */
CREATE TABLE TermsConditions (
    terms_id   INT      IDENTITY(1,1) PRIMARY KEY,
    content    TEXT,
    created_at DATETIME DEFAULT GETDATE()
);


/* ==============================
   5. BOOKINGS
================================= */
CREATE TABLE Bookings (
    booking_id     INT           IDENTITY(1,1) PRIMARY KEY,
    user_id        INT           NOT NULL,
    venue_id       INT           NOT NULL,
    terms_id       INT,                        -- T&C version accepted at booking
    event_date     DATE          NOT NULL,
    booking_status VARCHAR(20)   CHECK (booking_status IN
                                   ('pending','confirmed','cancelled','completed')),
    advance_paid   DECIMAL(10,2) DEFAULT 0,
    created_at     DATETIME      DEFAULT GETDATE(),

    CONSTRAINT FK_Bookings_User
        FOREIGN KEY (user_id)  REFERENCES Users(user_id),

    CONSTRAINT FK_Bookings_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id),

    CONSTRAINT FK_Bookings_Terms
        FOREIGN KEY (terms_id) REFERENCES TermsConditions(terms_id)
        ON DELETE SET NULL
);

-- Prevent double booking: same venue on same date
ALTER TABLE Bookings
ADD CONSTRAINT UQ_VenueDate UNIQUE (venue_id, event_date);


/* ==============================
   6. PAYMENTS
================================= */
CREATE TABLE Payments (
    payment_id     INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id     INT           NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20)   CHECK (payment_status IN ('paid','pending','refunded')),
    payment_date   DATETIME      DEFAULT GETDATE(),

    CONSTRAINT FK_Payments_Booking
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);


/* ==============================
   7. REFUNDS
   (booking_id NOT NULL — a refund must be tied to a booking)
================================= */
CREATE TABLE Refunds (
    refund_id     INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id    INT           NOT NULL,      -- FIXED: was nullable
    refund_amount DECIMAL(10,2),
    reason        VARCHAR(255),
    refund_date   DATETIME      DEFAULT GETDATE(),

    CONSTRAINT FK_Refunds_Booking
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);


/* ==============================
   8. REVIEWS
================================= */
CREATE TABLE Reviews (
    review_id  INT          IDENTITY(1,1) PRIMARY KEY,
    user_id    INT          NOT NULL,
    venue_id   INT          NOT NULL,
    rating     INT          CHECK (rating BETWEEN 1 AND 5),
    comment    VARCHAR(500),
    created_at DATETIME     DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_User
        FOREIGN KEY (user_id)  REFERENCES Users(user_id),

    CONSTRAINT FK_Reviews_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
);


/* ==============================
   9. MESSAGES (CHAT)
   sender_id and receiver_id are both FKs to Users — NOT PKs
================================= */
CREATE TABLE Messages (
    message_id   INT          IDENTITY(1,1) PRIMARY KEY,
    sender_id    INT          NOT NULL,        -- FK to Users (sender)
    receiver_id  INT          NOT NULL,        -- FK to Users (receiver)
    message_text VARCHAR(500),
    sent_at      DATETIME     DEFAULT GETDATE(),

    CONSTRAINT FK_Messages_Sender
        FOREIGN KEY (sender_id)   REFERENCES Users(user_id),

    CONSTRAINT FK_Messages_Receiver
        FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);


/* ==============================
   10. SUPPORT TICKETS
================================= */
CREATE TABLE SupportTickets (
    ticket_id  INT          IDENTITY(1,1) PRIMARY KEY,
    user_id    INT          NOT NULL,
    subject    VARCHAR(150),
    message    VARCHAR(500),
    status     VARCHAR(20)  DEFAULT 'open',
    created_at DATETIME     DEFAULT GETDATE(),

    CONSTRAINT FK_SupportTickets_User
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


/* ==============================
   11. DECORATIONS
================================= */
CREATE TABLE Decorations (
    decoration_id   INT           IDENTITY(1,1) PRIMARY KEY,
    venue_id        INT,
    decoration_name VARCHAR(150),
    description     VARCHAR(300),
    price           DECIMAL(10,2),

    CONSTRAINT FK_Decorations_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
        ON DELETE CASCADE
);


/* ==============================
   12. FOOD PACKAGES
================================= */
CREATE TABLE FoodPackages (
    food_id          INT           IDENTITY(1,1) PRIMARY KEY,
    venue_id         INT,
    package_name     VARCHAR(150),
    description      VARCHAR(300),
    price_per_person DECIMAL(10,2),

    CONSTRAINT FK_FoodPackages_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
        ON DELETE CASCADE
);


/* ==============================
   13. FAQs
   (venue_id FK added — venue-specific FAQs)
================================= */
CREATE TABLE FAQs (
    faq_id     INT          IDENTITY(1,1) PRIMARY KEY,
    venue_id   INT,                            -- FK: venue-specific FAQ
    question   VARCHAR(300) NOT NULL,
    answer     VARCHAR(500) NOT NULL,
    created_at DATETIME     DEFAULT GETDATE(),

    CONSTRAINT FK_FAQs_Venue
        FOREIGN KEY (venue_id) REFERENCES Venues(venue_id)
        ON DELETE SET NULL
);


/* ==============================
   14. CANCELLED BOOKINGS
   (ON DELETE SET NULL — booking may be soft-deleted)
================================= */
CREATE TABLE CancelledBookings (
    cancel_id     INT          IDENTITY(1,1) PRIMARY KEY,
    booking_id    INT,
    cancelled_by  INT,
    cancel_reason VARCHAR(300),
    cancelled_at  DATETIME     DEFAULT GETDATE(),

    CONSTRAINT FK_CancelledBookings_Booking
        FOREIGN KEY (booking_id)   REFERENCES Bookings(booking_id)
        ON DELETE SET NULL,        -- FIXED: was no ON DELETE rule

    CONSTRAINT FK_CancelledBookings_User
        FOREIGN KEY (cancelled_by) REFERENCES Users(user_id)
);


/* ==============================
   15. INDEXES
================================= */
CREATE INDEX idx_booking_date    ON Bookings(event_date);
CREATE INDEX idx_venue_location  ON Venues(location);
CREATE INDEX idx_reviews_rating  ON Reviews(rating);
CREATE INDEX idx_bookings_user   ON Bookings(user_id);
CREATE INDEX idx_bookings_venue  ON Bookings(venue_id);
CREATE INDEX idx_messages_sender ON Messages(sender_id);

/* ============================================================
    FUNCTIONALITIES FROM PROJECT PROPOSAL
============================================================ */
/* ============================================================
   16. FUNCTIONAL QUERIES FOR WEBSITE FEATURES
============================================================ */

/* 1. USER REGISTRATION */
INSERT INTO Users (full_name, email, password_hash, phone, role)
VALUES ('Ali Khan','ali@gmail.com','hashedpassword','03001234567','customer');


/* 2. USER LOGIN */
SELECT *
FROM Users
WHERE email = 'ali@gmail.com'
AND password_hash = 'hashedpassword';


/* 3. DISPLAY ALL VENUES (Homepage cards) */
SELECT venue_id, venue_name, city, town, capacity, price_per_event
FROM Venues;


/* 4. SEARCH VENUE BY CITY */
SELECT *
FROM Venues
WHERE city = 'Karachi';


/* 5. FILTER VENUE BY PRICE RANGE */
SELECT *
FROM Venues
WHERE price_per_event BETWEEN 200000 AND 500000;


/* 6. FILTER VENUE BY CAPACITY */
SELECT *
FROM Venues
WHERE capacity >= 500;


/* 7. SORT VENUES BY PRICE (LOW TO HIGH) */
SELECT *
FROM Venues
ORDER BY price_per_event ASC;


/* 8. SORT VENUES BY PRICE (HIGH TO LOW) */
SELECT *
FROM Venues
ORDER BY price_per_event DESC;


/* 9. SORT VENUES BY BEST RATING */
SELECT V.venue_id, V.venue_name, AVG(R.rating) AS average_rating
FROM Venues V
JOIN Reviews R ON V.venue_id = R.venue_id
GROUP BY V.venue_id, V.venue_name
ORDER BY average_rating DESC;


/* 10. CHECK VENUE AVAILABILITY */
SELECT *
FROM Bookings
WHERE venue_id = 1
AND event_date = '2026-12-15';


/* 11. CREATE BOOKING */
INSERT INTO Bookings (user_id, venue_id, terms_id, event_date, booking_status, advance_paid)
VALUES (1, 2, 1, '2026-12-15', 'pending', 50000);


/* 12. VIEW USER BOOKINGS */
SELECT B.booking_id, V.venue_name, B.event_date, B.booking_status
FROM Bookings B
JOIN Venues V ON B.venue_id = V.venue_id
WHERE B.user_id = 1;


/* 13. CONFIRM BOOKING (ADMIN / OWNER) */
UPDATE Bookings
SET booking_status = 'confirmed'
WHERE booking_id = 1;


/* 14. CANCEL BOOKING */
UPDATE Bookings
SET booking_status = 'cancelled'
WHERE booking_id = 1;


/* 15. INSERT INTO CANCELLED BOOKINGS TABLE */
INSERT INTO CancelledBookings (booking_id, cancelled_by, cancel_reason)
VALUES (1, 1, 'Event postponed');


/* 16. MAKE PAYMENT */
INSERT INTO Payments (booking_id, amount, payment_method, payment_status)
VALUES (1, 50000, 'Credit Card', 'paid');


/* 17. REQUEST REFUND */
INSERT INTO Refunds (booking_id, refund_amount, reason)
VALUES (1, 50000, 'Booking cancelled');


/* 18. ADD REVIEW */
INSERT INTO Reviews (user_id, venue_id, rating, comment)
VALUES (1, 2, 5, 'Amazing venue and great service');


/* 19. VIEW REVIEWS OF A VENUE */
SELECT U.full_name, R.rating, R.comment
FROM Reviews R
JOIN Users U ON R.user_id = U.user_id
WHERE R.venue_id = 2;


/* 20. SEND MESSAGE (CHAT SYSTEM) */
INSERT INTO Messages (sender_id, receiver_id, message_text)
VALUES (1, 2, 'Is the venue available in December?');


/* 21. VIEW CHAT BETWEEN TWO USERS */
SELECT *
FROM Messages
WHERE sender_id = 1 AND receiver_id = 2
OR sender_id = 2 AND receiver_id = 1
ORDER BY sent_at;


/* 22. VIEW VENUE DECORATION OPTIONS */
SELECT *
FROM Decorations
WHERE venue_id = 2;


/* 23. VIEW FOOD PACKAGES */
SELECT *
FROM FoodPackages
WHERE venue_id = 2;


/* 24. VIEW FAQs FOR A VENUE */
SELECT question, answer
FROM FAQs
WHERE venue_id = 2;


/* 25. CREATE SUPPORT TICKET */
INSERT INTO SupportTickets (user_id, subject, message)
VALUES (1, 'Payment Issue', 'My payment was deducted but booking not confirmed');


/* 26. ADMIN VIEW ALL BOOKINGS */
SELECT B.booking_id, U.full_name, V.venue_name, B.event_date, B.booking_status
FROM Bookings B
JOIN Users U ON B.user_id = U.user_id
JOIN Venues V ON B.venue_id = V.venue_id;


/* 27. ANALYTICS: MOST BOOKED VENUES */
SELECT V.venue_name, COUNT(B.booking_id) AS total_bookings
FROM Venues V
JOIN Bookings B ON V.venue_id = B.venue_id
GROUP BY V.venue_name
ORDER BY total_bookings DESC;


/* 28. MONTHLY BOOKING STATISTICS */
SELECT MONTH(event_date) AS month, COUNT(*) AS bookings
FROM Bookings
GROUP BY MONTH(event_date)
ORDER BY month;



/* 29. IMAGE GALLERY FOR VENUE */

SELECT image_url
FROM VenueImages
WHERE venue_id = 2;



/* 30. SHOW FULL IMAGE GALLERY */

SELECT V.venue_name, I.image_url
FROM Venues V
JOIN VenueImages I ON V.venue_id = I.venue_id
WHERE V.venue_id = 2;



/* 31. IN-PROGRESS EVENT TRACKING */

SELECT B.booking_id, V.venue_name, B.event_date
FROM Bookings B
JOIN Venues V ON B.venue_id = V.venue_id
WHERE B.booking_status = 'confirmed'
AND B.event_date >= CURRENT_DATE;



/* 32. AVAILABILITY CALENDAR (SHOW BOOKED DATES) */

SELECT event_date
FROM Bookings
WHERE venue_id = 2
AND booking_status = 'confirmed';



/* 33. CHECK DATE AVAILABILITY BEFORE BOOKING */

SELECT *
FROM Bookings
WHERE venue_id = 2
AND event_date = '2026-12-20';



/* 34. PAYMENT HISTORY FOR USER */

SELECT P.payment_id, P.amount, P.payment_status, B.event_date
FROM Payments P
JOIN Bookings B ON P.booking_id = B.booking_id
WHERE B.user_id = 1;


