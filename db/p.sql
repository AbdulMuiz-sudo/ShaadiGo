USE shaadigo_db;
GO

-- 1. Insert Venue Owners First (Needed for owner_id Foreign Key)
INSERT INTO users (full_name, email, password_hash, phone, role)
VALUES 
('Ahmad Raza', 'ahmad.owner@shaadigo.com', 'dummyhash123', '03001234567', 'owner'),
('Zainab Tariq', 'zainab.owner@shaadigo.com', 'dummyhash456', '03211234567', 'owner');
GO

-- 2. Insert Venues 
-- (Assuming Ahmad is user_id 1 and Zainab is user_id 2. If your table isn't fresh, check their IDs first)
INSERT INTO venues (owner_id, venue_name, location, city, town, capacity, price_per_event, description, cancellation_policy)
VALUES 
(1, 'Mughal-e-Azam Banquet', 'New Garden Town', 'Lahore', 'Garden Town', 800, 350000.00, 'A luxurious banquet hall with traditional Mughal architecture and crystal chandeliers.', '7 days prior notice for 80% refund.'),
(1, 'Garrison Golf and Country Club', 'Aziz Bhatti Road, Cantt', 'Lahore', 'Lahore Cantt', 1200, 550000.00, 'Premium outdoor and indoor wedding venues with scenic golf course views. Perfect for large gatherings.', '14 days prior notice for 50% refund.'),
(2, 'Oasis Marquee', 'Main Boulevard, Gulberg III', 'Lahore', 'Gulberg', 600, 250000.00, 'Modern marquee with elegant decor and central air conditioning.', '10 days prior notice for full refund minus advance.'),
(2, 'Serena Banquet', 'Sector F-7, Markaz', 'Islamabad', 'F-7', 400, 450000.00, 'Elite banqueting experience with top-tier catering and valet services.', 'Non-refundable advance.');
GO

-- 3. Insert Venue Images (Assuming the venues above got IDs 1, 2, 3, and 4)
INSERT INTO venue_images (venue_id, image_url)
VALUES
(1, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000'),
(1, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000'),
(2, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000'),
(3, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000'),
(4, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000');
GO

-- 4. Insert Food Packages
INSERT INTO food_packages (venue_id, package_name, description, price_per_person)
VALUES
(1, 'Traditional Royal', 'Chicken Qorma, Mutton Biryani, Seekh Kebab, Roghni Naan, Gajar Halwa', 2500.00),
(1, 'Standard Buffet', 'Chicken Karahi, Chicken Pulao, Raita, Fresh Salad, Kheer', 1800.00),
(2, 'Elite Continental', 'Mutton Mandi, Prawn Tempura, Reshmi Kebab, Live BBQ Station, Chocolate Lava Cake', 4500.00),
(3, 'Economy Feast', 'Chicken Biryani, Daal Mash, Chicken Tikka, Roti, Trifle', 1200.00),
(4, 'Capital Premium', 'Mutton Qorma, Chicken Manchurian, Egg Fried Rice, Fish Tikka, Shahi Tukda', 3500.00);
GO

-- 5. Insert Decorations
INSERT INTO decorations (venue_id, decoration_name, description, price)
VALUES
(1, 'Floral Archway & Golden Stage', 'Imported red roses and white lilies with premium golden seating.', 75000.00),
(2, 'Fairy Light Canopy', 'Outdoor setup with extensive fairy lights, rustic wooden tables, and hanging lanterns.', 120000.00),
(3, 'Minimalist Elegance', 'White silk drapery with subtle floral centerpieces and soft backlighting.', 45000.00),
(4, 'The Royal Red', 'Deep red velvet curtains, crystal chandeliers, and grand floral pillars.', 95000.00);
GO

-- 6. Insert Some Dummy Reviews so the avg_rating view works
INSERT INTO reviews (user_id, venue_id, rating, comment)
VALUES
(1, 1, 5, 'Absolutely stunning venue! The management was very cooperative.'),
(2, 1, 4, 'Great food, but parking was a bit tight.'),
(1, 2, 5, 'Beautiful golf course view. The outdoor setup was magical.'),
(2, 3, 3, 'Average experience. The AC was not cooling properly.'),
(1, 4, 5, 'Top notch service in Islamabad. Highly recommended.');
GO