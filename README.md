# BeanCraft – Restaurant Management System
### A Complete College DBMS Project (Full-Stack Relational Database Application)

BeanCraft is a simple, attractive, and production-ready Restaurant Management System designed specifically for college DBMS course submissions, lab demonstrations, and viva exams.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend** | React, Vite, React Router DOM, Bootstrap 5, Bootstrap Icons |
| **Data Visualization** | Recharts (Admin Revenue Analytics) |
| **HTTP Client** | Axios (with JWT interceptors) |
| **Backend** | Node.js, Express.js (REST APIs) |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs password hashing |
| **Database** | MySQL 8.0 / MariaDB (Relational DBMS with Foreign Keys) |
| **Driver** | `mysql2/promise` with Connection Pooling |

---

## 📁 Project Structure

```
BeanCraft/
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Customer.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminMenu.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   └── └── AdminPayments.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js + Express REST API Server
│   ├── config/
│   │   └── db.js                 # MySQL2 connection pool & query engine
│   ├── middleware/
│   │   └── auth.js               # JWT verification & Admin RBAC
│   ├── routes/
│   │   ├── auth.js               # POST /signup, POST /login
│   │   ├── menu.js               # GET, POST, PUT, DELETE /menu
│   │   ├── orders.js             # POST, GET, PUT /orders
│   │   ├── payments.js           # POST, GET /payments
│   │   ├── bookings.js           # POST, GET, PUT /bookings
│   │   ├── customers.js          # GET /customers (SQL JOIN & COUNT)
│   │   └── dashboard.js          # GET /stats, GET /revenue (SQL SUM & Recharts)
│   ├── server.js
│   ├── package.json
│   └── .env
├── database/
│   └── beancraft.sql             # Complete MySQL DDL & DML Schema Script
└── README.md
```

---

## 🗄️ Database Architecture (6 Normalized Tables)

### Entity-Relationship Connections:
1. `users` (1) ── (N) `orders` [Foreign Key: `orders.user_id` → `users.id`]
2. `orders` (1) ── (N) `order_items` [Foreign Key: `order_items.order_id` → `orders.id`]
3. `menu` (1) ── (N) `order_items` [Foreign Key: `order_items.menu_id` → `menu.id`]
4. `orders` (1) ── (1) `payments` [Foreign Key: `payments.order_id` → `orders.id`]
5. `users` (1) ── (N) `bookings` [Foreign Key: `bookings.user_id` → `users.id`]

### Table Definitions & Primary/Foreign Keys:

1. **`users`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `name` VARCHAR(100) NOT NULL
   - `email` VARCHAR(100) NOT NULL UNIQUE
   - `password` VARCHAR(255) NOT NULL (bcrypt hashed)
   - `role` ENUM('customer', 'admin') DEFAULT 'customer'
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. **`menu`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `name` VARCHAR(100) NOT NULL
   - `description` TEXT
   - `price` DECIMAL(10,2) NOT NULL
   - `image` VARCHAR(255)
   - `available` BOOLEAN DEFAULT TRUE

3. **`orders`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `user_id` INT NOT NULL, FOREIGN KEY REFERENCES `users(id)` ON DELETE CASCADE
   - `total` DECIMAL(10,2) NOT NULL
   - `status` ENUM('Pending', 'Preparing', 'Completed', 'Cancelled') DEFAULT 'Pending'
   - `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

4. **`order_items`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `order_id` INT NOT NULL, FOREIGN KEY REFERENCES `orders(id)` ON DELETE CASCADE
   - `menu_id` INT NOT NULL, FOREIGN KEY REFERENCES `menu(id)` ON DELETE RESTRICT
   - `quantity` INT NOT NULL
   - `price` DECIMAL(10,2) NOT NULL

5. **`payments`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `order_id` INT NOT NULL, FOREIGN KEY REFERENCES `orders(id)` ON DELETE CASCADE
   - `amount` DECIMAL(10,2) NOT NULL
   - `method` ENUM('Cash', 'UPI', 'Card') NOT NULL
   - `status` ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Paid'
   - `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

6. **`bookings`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `user_id` INT NOT NULL, FOREIGN KEY REFERENCES `users(id)` ON DELETE CASCADE
   - `table_no` VARCHAR(10) NOT NULL (T1 to T5)
   - `date` DATE NOT NULL
   - `time` VARCHAR(20) NOT NULL
   - `guests` INT NOT NULL
   - `status` ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending'

---

## 🚀 Setup & Execution Guide

### 1. Install Dependencies
In the root directory (or respective frontend & backend directories):
```bash
npm install
```

### 2. Create MySQL Database
Open your MySQL terminal, MySQL Workbench, or phpMyAdmin:
```sql
CREATE DATABASE beancraft;
```

### 3. Import `database/beancraft.sql`
Run the import command via terminal:
```bash
mysql -u root -p beancraft < database/beancraft.sql
```
*Or open phpMyAdmin → Select `beancraft` database → Click **Import** tab → Choose `database/beancraft.sql` → Click **Go**.*

### 4. Configure `.env`
Create or edit `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=beancraft
DB_PORT=3306
JWT_SECRET=beancraft_super_secret_jwt_key_2026
```

### 5. Start Backend Server
```bash
# Standalone Backend (port 5000 or 3000)
node backend/server.js
```

### 6. Start Frontend Server
```bash
# In the project root or frontend directory:
npm run dev
```
The application will launch at: `http://localhost:3000`

---

## 🔑 Default Login Credentials

### 🛡️ Admin Account
- **Email:** `admin@beancraft.com`
- **Password:** `admin123`
- **Access:** Directs to `/admin` dashboard with full control over orders, menu, bookings, customers, and revenue analytics.

### 👤 Sample Customer Account
- **Email:** `customer@beancraft.com` (or create any new account via Signup)
- **Password:** `admin123`
- **Access:** Directs to `/customer` cafe portal.

---

## 🧪 Demonstration Test Cases (Viva Live Demo)

### Test 1 – Order Workflow
1. Login as **Customer** (`customer@beancraft.com` / `admin123`).
2. Navigate to **Menu** → Click **Add to Cart** on "Cappuccino" and "Cheese Burst Pizza".
3. Open **Cart** → Review quantity and subtotal → Click **Place Order**.
4. Order is saved in MySQL `orders` and `order_items` with status `Pending`.
5. Login as **Admin** (`admin@beancraft.com` / `admin123`) in another tab or after logout.
6. Open **Admin Orders** → The newly placed customer order appears at the top.
7. Change status dropdown from **Pending** to **Preparing**.
8. Switch back to Customer → Open **My Orders** → The status is live updated to **Preparing**!

### Test 2 – Table Reservation Workflow
1. Customer visits **Book Table** → Select Table **T3**, Date, Time, and 4 Guests → Click **Confirm & Book**.
2. Reservation is inserted into MySQL `bookings` table with status `Pending`.
3. Admin opens **Admin Bookings** → Customer's reservation appears.
4. Admin clicks **Confirm**. Status updates to `Confirmed` in MySQL.
5. Customer views **My Table Bookings** → Status immediately reflects `Confirmed`.

---

## 🎓 10 DBMS Viva Questions & Answers (Project-Specific)

### Q1: What is the database name and how many tables are there in BeanCraft?
> **Answer:** The database name is `beancraft`. It consists of exactly **6 normalized tables**: `users`, `menu`, `orders`, `order_items`, `payments`, and `bookings`.

### Q2: Why is the `order_items` table required instead of storing items directly in the `orders` table?
> **Answer:** Storing items directly in `orders` would violate **First Normal Form (1NF)** due to multivalued attributes (a single order can contain multiple food items with varying quantities). `order_items` acts as an associative/junction entity between `orders` and `menu`, resolving the Many-to-Many relationship into two One-to-Many relationships.

### Q3: What Primary Keys and Foreign Keys exist in BeanCraft?
> **Answer:**
> - Each table has an integer `id AUTO_INCREMENT PRIMARY KEY`.
> - **Foreign Keys:**
>   - `orders.user_id` references `users(id)`
>   - `order_items.order_id` references `orders(id)`
>   - `order_items.menu_id` references `menu(id)`
>   - `payments.order_id` references `orders(id)`
>   - `bookings.user_id` references `users(id)`

### Q4: What `ON DELETE` cascade constraints are implemented and why?
> **Answer:**
> - `ON DELETE CASCADE` is set on `orders.user_id`, `order_items.order_id`, and `payments.order_id`. If an order or user record is deleted, all child items and payment records are automatically cleaned up to maintain referential integrity.
> - `ON DELETE RESTRICT` is used on `order_items.menu_id` so that an active menu item that has historical order transactions cannot be accidentally deleted from the database.

### Q5: How is Total Revenue calculated in the Admin Dashboard?
> **Answer:** It uses the SQL aggregate function `SUM()`:
> ```sql
> SELECT SUM(amount) AS total_revenue FROM payments WHERE status = 'Paid';
> ```
> This guarantees that revenue reflects only verified, completed payments stored in the relational database.

### Q6: How does the Admin Customers page show the total number of orders per customer?
> **Answer:** It uses an **aggregate `COUNT()` with a `LEFT JOIN` and `GROUP BY` clause**:
> ```sql
> SELECT users.id, users.name, users.email, COUNT(orders.id) AS total_orders
> FROM users
> LEFT JOIN orders ON users.id = orders.user_id
> WHERE users.role = 'customer'
> GROUP BY users.id, users.name, users.email;
> ```
> A `LEFT JOIN` ensures that customers who have registered but not yet ordered are still listed with `total_orders = 0`.

### Q7: How are user passwords secured before entering the MySQL database?
> **Answer:** Passwords are never stored in plaintext. When a user registers or logs in, the backend uses **bcryptjs** with 10 salt rounds (`bcrypt.hash`) to create a secure one-way cryptographic hash. During login, `bcrypt.compare` verifies the entered password against the stored hash.

### Q8: What SQL DML operations are demonstrated across the project?
> **Answer:**
> - **SELECT**: Fetching menu items, order history, customer lists, and revenue.
> - **INSERT**: Customer registration, placing orders, adding order items, making payments, and booking tables.
> - **UPDATE**: Admin changing order status (`Pending` → `Preparing`), confirming bookings, and editing menu item prices.
> - **DELETE**: Removing items from the cafe menu.

### Q9: What level of database normalization does this schema achieve?
> **Answer:** The schema achieves **Third Normal Form (3NF)**:
> 1. **1NF**: All column values are atomic; no repeating groups or comma-separated lists.
> 2. **2NF**: All non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
> 3. **3NF**: There are no transitive dependencies (non-prime attributes depend only on the primary key).

### Q10: How does the application connect to MySQL from Node.js?
> **Answer:** It uses the **`mysql2/promise`** library with a connection pool (`mysql.createPool()`). The connection pool reuses database connections efficiently for concurrent customer orders, supports parameterized queries (`?` placeholders) to prevent **SQL Injection**, and returns native JavaScript Promises for async/await execution.
