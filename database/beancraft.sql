
CREATE DATABASE IF NOT EXISTS beancraft;
USE beancraft;

-- Drop tables in reverse dependency order if recreating
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS users;


--1. Table structure for table `users`

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. Table structure for table `menu`
CREATE TABLE menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    available BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. Table structure for table `orders`

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Preparing', 'Completed', 'Cancelled') DEFAULT 'Pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. Table structure for table `order_items`

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_menu FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. Table structure for table `payments`

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('Cash', 'UPI', 'Card') NOT NULL,
    status ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Paid',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6. Table structure for table `bookings`

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    table_no VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    guests INT NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- SAMPLE DATA INSERTION


-- Admin User: admin@beancraft.com / admin123
-- Sample Customer: rahul@gmail.com / customer123
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin BeanCraft', 'admin@beancraft.com', '$2b$10$6uWVoJFEFbdlCqk08Tn8d.mVePF5/h35Cft8FatznPMJBoSeqJ5NS', 'admin'),
(2, 'Rahul Sharma', 'customer@beancraft.com', '$2b$10$6uWVoJFEFbdlCqk08Tn8d.mVePF5/h35Cft8FatznPMJBoSeqJ5NS', 'customer');

-- Menu Items
INSERT INTO menu (id, name, description, price, image, available) VALUES
(1, 'Cappuccino', 'Rich espresso layered with frothy steamed milk and a dusting of cocoa.', 149.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80', 1),
(2, 'Cold Coffee', 'Creamy brewed coffee served chilled over ice with chocolate drizzle.', 149.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', 1),
(3, 'Margherita Pizza', 'Classic hand-tossed crust with aromatic tomato sauce, fresh mozzarella, and basil.', 249.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80', 1),
(4, 'Cheese Burst Pizza', 'Decadent melted liquid cheese crust topped with herbs, bell peppers, and olives.', 349.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', 1),
(5, 'Veg Burger', 'Crispy spiced vegetable patty with crisp lettuce, pickled gherkins, and signature sauce.', 179.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1),
(6, 'Peri Peri Fries', 'Crispy golden fries tossed in fiery African peri peri spice blend.', 129.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', 1),
(7, 'Brownie', 'Warm chocolate fudge brownie loaded with walnuts and served with chocolate syrup.', 149.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 1);

-- Sample Initial Orders & Payments
INSERT INTO orders (id, user_id, total, status, order_date) VALUES
(101, 2, 298.00, 'Completed', NOW() - INTERVAL 2 DAY),
(102, 2, 428.00, 'Preparing', NOW() - INTERVAL 1 HOUR);

INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES
(101, 1, 2, 149.00),
(102, 3, 1, 249.00),
(102, 5, 1, 179.00);

INSERT INTO payments (order_id, amount, method, status, payment_date) VALUES
(101, 298.00, 'UPI', 'Paid', NOW() - INTERVAL 2 DAY),
(102, 428.00, 'Card', 'Paid', NOW() - INTERVAL 1 HOUR);

-- Sample Booking
INSERT INTO bookings (id, user_id, table_no, date, time, guests, status) VALUES
(1, 2, 'T3', CURDATE() + INTERVAL 1 DAY, '19:30', 4, 'Confirmed');
