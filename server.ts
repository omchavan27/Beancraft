import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initDb } from './backend/config/db.js';

// Route handlers
import authRoutes from './backend/routes/auth.js';
import menuRoutes from './backend/routes/menu.js';
import ordersRoutes from './backend/routes/orders.js';
import paymentsRoutes from './backend/routes/payments.js';
import bookingsRoutes from './backend/routes/bookings.js';
import customersRoutes from './backend/routes/customers.js';
import dashboardRoutes from './backend/routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize relational database (MySQL with automatic fallback)
  await initDb();

  app.use(cors());
  app.use(express.json());

  // Mount backend API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      project: 'BeanCraft – Restaurant Management System',
      time: new Date().toISOString(),
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`☕ BeanCraft Full-Stack Application listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
