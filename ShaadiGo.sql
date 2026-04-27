-- 1. Create the login
CREATE LOGIN shaadigo_username WITH PASSWORD = 'Shaadi123!';

-- 2. Create the user in your database
USE fse_shaadi_go;
CREATE USER shaadigo_username FOR LOGIN shaadigo_username;

-- 3. Give it full access
ALTER ROLE db_owner ADD MEMBER shaadigo_username;



-- Users
CREATE TABLE users (
  user_id       INT IDENTITY(1,1) PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME DEFAULT GETDATE()
);

-- Venues
CREATE TABLE venues (
  venue_id        INT IDENTITY(1,1) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  city            VARCHAR(50) NOT NULL,
  location        VARCHAR(100) NOT NULL,
  capacity        INT NOT NULL,
  price_per_event DECIMAL(12, 2) NOT NULL,
  rating          DECIMAL(3, 1) DEFAULT 0.0,
  review_count    INT DEFAULT 0,
  description     TEXT,
  emoji           VARCHAR(10),
  created_at      DATETIME DEFAULT GETDATE()
);

-- Booked dates per venue
CREATE TABLE venue_unavailable_dates (
  id               INT IDENTITY(1,1) PRIMARY KEY,
  venue_id         INT NOT NULL,
  unavailable_date DATE NOT NULL,
  CONSTRAINT fk_vud_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
  CONSTRAINT uq_venue_date UNIQUE (venue_id, unavailable_date)
);

-- Bookings
CREATE TABLE bookings (
  booking_id       INT IDENTITY(1,1) PRIMARY KEY,
  user_id          INT NOT NULL,
  venue_id         INT NOT NULL,
  fname            VARCHAR(50) NOT NULL,
  lname            VARCHAR(50) NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  event_type       VARCHAR(30) NOT NULL,
  guest_count      INT,
  special_requests TEXT,
  event_date       DATE NOT NULL,
  hall_price       DECIMAL(12, 2) NOT NULL,
  service_fee      DECIMAL(12, 2) NOT NULL,
  total_price      DECIMAL(12, 2) NOT NULL,
  advance_paid     DECIMAL(12, 2) NOT NULL,
  status           VARCHAR(20) DEFAULT 'pending',
  created_at       DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_booking_user  FOREIGN KEY (user_id)  REFERENCES users(user_id),
  CONSTRAINT fk_booking_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

-- Contact messages
CREATE TABLE contact_messages (
  message_id   INT IDENTITY(1,1) PRIMARY KEY,
  fname        VARCHAR(50) NOT NULL,
  lname        VARCHAR(50),
  email        VARCHAR(100) NOT NULL,
  phone        VARCHAR(20),
  inquiry_type VARCHAR(20) DEFAULT 'inquiry',
  subject      VARCHAR(150),
  booking_ref  VARCHAR(30),
  priority     VARCHAR(10) DEFAULT 'med',
  message      TEXT NOT NULL,
  submitted_at DATETIME DEFAULT GETDATE()
);
-- Chat messages table
CREATE TABLE chat_messages (
  message_id   INT IDENTITY(1,1) PRIMARY KEY,
  booking_id   INT NOT NULL,
  user_id      INT NOT NULL,
  sender       VARCHAR(10) NOT NULL CHECK (sender IN ('customer','owner')),
  message      NVARCHAR(MAX) NOT NULL,
  sent_at      DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_chat_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  CONSTRAINT fk_chat_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
);

 CREATE TABLE reviews (
  review_id   INT IDENTITY(1,1) PRIMARY KEY,
  booking_id  INT NOT NULL,
  user_id     INT NOT NULL,
  venue_id    INT NOT NULL,
  rating      DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text NVARCHAR(MAX),
  created_at  DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  CONSTRAINT fk_review_user    FOREIGN KEY (user_id)    REFERENCES users(user_id),
  CONSTRAINT fk_review_venue   FOREIGN KEY (venue_id)   REFERENCES venues(venue_id),
  CONSTRAINT uq_one_review_per_booking UNIQUE (booking_id)
);

ALTER TABLE venues ALTER COLUMN emoji NVARCHAR(10);

-- Update all emojis
UPDATE venues SET emoji = N'🏛️' WHERE venue_id = 1;
UPDATE venues SET emoji = N'✨'  WHERE venue_id = 2;
UPDATE venues SET emoji = N'🌸'  WHERE venue_id = 3;
UPDATE venues SET emoji = N'🌹'  WHERE venue_id = 4;
UPDATE venues SET emoji = N'🕌'  WHERE venue_id = 5;
UPDATE venues SET emoji = N'🏰'  WHERE venue_id = 6;


select * from contact_messages
INSERT INTO venues (name, city, location, capacity, price_per_event, rating, review_count, description, emoji)
VALUES
  ('Pearl Continental Hall',  'Lahore',    'Gulberg, Lahore',   800,  450000, 4.8, 124, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '🏛️'),
  ('Royal Banquet Gardens',   'Karachi',   'Clifton, Karachi',  1200, 600000, 4.8,  98, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '✨'),
  ('Margalla Majestic Hall',  'Islamabad', 'F-7, Islamabad',    600,  380000, 4.8,  76, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '🌸'),
  ('Golden Marquee Lahore',   'Lahore',    'DHA, Lahore',       1000, 320000, 4.6,  55, 'A breathtaking marquee venue with lush greenery, world-class catering and an expert wedding management team at your service.', '🌹'),
  ('Al-Noor Grand Hall',      'Karachi',   'Gulshan, Karachi',  900,  520000, 4.7,  89, 'Timeless elegance meets warm hospitality in this iconic Karachi venue, perfect for both intimate and grand celebrations.', '🕌'),
  ('Serene Garden Marquee',   'Islamabad', 'E-11, Islamabad',   500,  280000, 4.5,  42, 'An open-air paradise surrounded by manicured gardens, fairy lights and mountain backdrop views for an unforgettable evening.', '🏰');

-- Add image support to chat_messages
ALTER TABLE chat_messages ADD message_type VARCHAR(10) DEFAULT 'text';
ALTER TABLE chat_messages ADD image_data   NVARCHAR(MAX) NULL;

-- Add refund columns to bookings table
ALTER TABLE bookings ADD refund_percent  INT DEFAULT 0;
ALTER TABLE bookings ADD refund_amount   DECIMAL(12,2) DEFAULT 0;
ALTER TABLE bookings ADD refund_status   VARCHAR(20) DEFAULT 'none';
ALTER TABLE bookings ADD cancelled_at    DATETIME NULL;

USE fse_shaadi_go;
select * from reviews
select * from chat_messages
select * from venues
select * from bookings
select * from users


