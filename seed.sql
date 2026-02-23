-- Webshop seed data
-- All user passwords are: password123

-- Clear existing data (order matters due to foreign keys)
TRUNCATE order_item, "order", product, category, "user" RESTART IDENTITY CASCADE;

-- Categories
INSERT INTO category (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Books'),
  ('Home & Garden'),
  ('Sports');

-- Users (password: password123)
INSERT INTO "user" (email, password, name, role) VALUES
  ('admin@webshop.com', '$2b$10$xRW/pkO1ZFMfRR/dQfTQT.aejt7AMvZliWPqVbrfooMnMMOcGX.8K', 'Admin', 'admin'),
  ('john@mail.com', '$2b$10$xRW/pkO1ZFMfRR/dQfTQT.aejt7AMvZliWPqVbrfooMnMMOcGX.8K', 'John Doe', 'customer'),
  ('jane@mail.com', '$2b$10$xRW/pkO1ZFMfRR/dQfTQT.aejt7AMvZliWPqVbrfooMnMMOcGX.8K', 'Jane Smith', 'customer');

-- Products
INSERT INTO product (name, description, price, stock, "categoryId") VALUES
  ('Mechanical Keyboard',   'RGB mechanical keyboard with Cherry MX switches',   79.99,  50, 1),
  ('Wireless Mouse',        'Ergonomic wireless mouse with 4000 DPI sensor',     29.99,  120, 1),
  ('USB-C Hub',             '7-in-1 USB-C hub with HDMI and ethernet',           49.99,  75, 1),
  ('Noise Cancelling Headphones', 'Over-ear headphones with ANC',               149.99,  30, 1),
  ('Plain White T-Shirt',   '100% cotton, unisex',                               14.99,  200, 2),
  ('Denim Jacket',          'Classic blue denim jacket',                          59.99,  45, 2),
  ('Running Shoes',         'Lightweight running shoes',                          89.99,  60, 2),
  ('Clean Code',            'Robert C. Martin - A handbook of agile software',    34.99,  100, 3),
  ('Design Patterns',       'Gang of Four - Elements of reusable software',       44.99,  80, 3),
  ('The Pragmatic Programmer', 'Hunt & Thomas - From journeyman to master',      39.99,  90, 3),
  ('Standing Desk',         'Electric adjustable standing desk 120x60cm',        299.99,  15, 4),
  ('Desk Lamp',             'LED desk lamp with adjustable brightness',           24.99,  100, 4),
  ('Yoga Mat',              'Non-slip yoga mat 6mm thick',                        19.99,  150, 5),
  ('Dumbbell Set',          'Adjustable dumbbells 2-20kg pair',                  129.99,  25, 5);

-- Orders for John (user id 2)
INSERT INTO "order" (status, total, "userId") VALUES
  ('delivered', 159.97, 2),
  ('pending',    89.99, 2);

-- Orders for Jane (user id 3)
INSERT INTO "order" (status, total, "userId") VALUES
  ('paid', 79.98, 3);

-- Order items
-- John's first order: keyboard + 2x mouse
INSERT INTO order_item (quantity, price, "orderId", "productId") VALUES
  (1, 79.99, 1, 1),
  (2, 29.99, 1, 2),
  (1, 19.99, 1, 13);

-- John's second order: running shoes
INSERT INTO order_item (quantity, price, "orderId", "productId") VALUES
  (1, 89.99, 2, 7);

-- Jane's order: 2x white t-shirts
INSERT INTO order_item (quantity, price, "orderId", "productId") VALUES
  (2, 14.99, 3, 5),
  (1, 49.99, 3, 3);
