import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/db.js';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';
import bookingsRoutes from './routes/bookings.js';
import customersRoutes from './routes/customers.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'BeanCraft – Restaurant Management System',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and start server
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`☕ BeanCraft Backend Server running on port ${PORT}`);
  });
};

// If run directly (e.g. `node backend/server.js`)
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export { app, startServer };
export default app;
