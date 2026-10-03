import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration for MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'beancraft',
  database: process.env.DB_NAME || 'beancraft',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let mysqlPool = null;
let sqlJsDb = null;
let isUsingMySQL = false;
let isInitialized = false;

// Initial schema and data for relational SQL engine fallback
const initSqlJsEngine = async () => {
  if (sqlJsDb) return sqlJsDb;

  const SQL = await initSqlJs();
  sqlJsDb = new SQL.Database();

  // Create tables exactly matching beancraft.sql
  sqlJsDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      available INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'Paid',
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      table_no TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Admin: admin@beancraft.com / admin123
  // Customer: customer@beancraft.com / admin123
  const adminHash = '$2b$10$6uWVoJFEFbdlCqk08Tn8d.mVePF5/h35Cft8FatznPMJBoSeqJ5NS';

  sqlJsDb.run(`
    INSERT INTO users (id, name, email, password, role) VALUES
    (1, 'Admin BeanCraft', 'admin@beancraft.com', '${adminHash}', 'admin'),
    (2, 'Rahul Sharma', 'customer@beancraft.com', '${adminHash}', 'customer');

    INSERT INTO menu (id, name, description, price, image, available) VALUES
    (1, 'Cappuccino', 'Rich espresso layered with frothy steamed milk and a dusting of cocoa.', 149.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80', 1),
    (2, 'Cold Coffee', 'Creamy brewed coffee served chilled over ice with chocolate drizzle.', 149.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', 1),
    (3, 'Margherita Pizza', 'Classic hand-tossed crust with aromatic tomato sauce, fresh mozzarella, and basil.', 249.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80', 1),
    (4, 'Cheese Burst Pizza', 'Decadent melted liquid cheese crust topped with herbs, bell peppers, and olives.', 349.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', 1),
    (5, 'Veg Burger', 'Crispy spiced vegetable patty with crisp lettuce, pickled gherkins, and signature sauce.', 179.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1),
    (6, 'Peri Peri Fries', 'Crispy golden fries tossed in fiery African peri peri spice blend.', 129.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', 1),
    (7, 'Brownie', 'Warm chocolate fudge brownie loaded with walnuts and served with chocolate syrup.', 149.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 1);

    INSERT INTO orders (id, user_id, total, status, order_date) VALUES
    (101, 2, 298.00, 'Completed', datetime('now', '-2 days')),
    (102, 2, 428.00, 'Preparing', datetime('now', '-1 hours'));

    INSERT INTO order_items (id, order_id, menu_id, quantity, price) VALUES
    (1, 101, 1, 2, 149.00),
    (2, 102, 3, 1, 249.00),
    (3, 102, 5, 1, 179.00);

    INSERT INTO payments (id, order_id, amount, method, status, payment_date) VALUES
    (1, 101, 298.00, 'UPI', 'Paid', datetime('now', '-2 days')),
    (2, 102, 428.00, 'Card', 'Paid', datetime('now', '-1 hours'));

    INSERT INTO bookings (id, user_id, table_no, date, time, guests, status) VALUES
    (1, 2, 'T3', date('now', '+1 day'), '19:30', 4, 'Confirmed');
  `);

  console.log('✅ Relational SQL Engine initialized with beancraft database schema and seed data.');
  return sqlJsDb;
};

// Initialize connection
export const initDb = async () => {
  if (isInitialized) return;

  try {
    mysqlPool = mysql.createPool(dbConfig);
    const conn = await mysqlPool.getConnection();
    await conn.ping();
    conn.release();
    isUsingMySQL = true;
    console.log(`✅ Connected to MySQL Database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
  } catch (err) {
    console.log(`⚠️ MySQL connection to ${dbConfig.host}:${dbConfig.port} unavailable (${err.message}).`);
    console.log('🔄 Activating Relational SQL Engine for seamless execution & demo testing.');
    await initSqlJsEngine();
    isUsingMySQL = false;
  }
  isInitialized = true;
};

// Unified database query interface matching [rows, fields] format of mysql2
export const query = async (sql, params = []) => {
  if (!isInitialized) {
    await initDb();
  }

  if (isUsingMySQL && mysqlPool) {
    return await mysqlPool.query(sql, params);
  }

  // Fallback to Relational SQL engine
  const db = await initSqlJsEngine();
  const trimmed = sql.trim();
  const isSelect = /^SELECT/i.test(trimmed) || /^SHOW/i.test(trimmed) || /^DESCRIBE/i.test(trimmed);

  try {
    if (isSelect) {
      const stmt = db.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, []];
    } else {
      // Execute INSERT, UPDATE, DELETE
      db.run(sql, params);
      const changesRes = db.exec('SELECT last_insert_rowid() AS insertId, changes() AS affectedRows');
      let insertId = 0;
      let affectedRows = 0;
      if (changesRes.length > 0 && changesRes[0].values.length > 0) {
        insertId = changesRes[0].values[0][0];
        affectedRows = changesRes[0].values[0][1];
      }
      return [{ insertId, affectedRows }, []];
    }
  } catch (error) {
    console.error('SQL Execution Error:', error.message, 'Query:', sql, 'Params:', params);
    throw error;
  }
};

export const getDbStatus = () => {
  return {
    engine: isUsingMySQL ? 'MySQL 8.0' : 'Relational SQL Engine (MySQL Compatible)',
    host: isUsingMySQL ? dbConfig.host : 'Embedded In-Memory',
    database: 'beancraft',
    connected: true,
  };
};

export default {
  query,
  initDb,
  getDbStatus,
};
