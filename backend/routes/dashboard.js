import express from 'express';
import { query, getDbStatus } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/stats - Admin Dashboard Statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    // 1. Total Revenue from payments where status = 'Paid' using SQL SUM
    const [revResult] = await query('SELECT SUM(amount) AS total_revenue FROM payments WHERE status = "Paid"');
    const totalRevenue = revResult.length > 0 && revResult[0].total_revenue ? Number(revResult[0].total_revenue) : 0;

    // 2. Total Orders using SQL COUNT
    const [ordersResult] = await query('SELECT COUNT(*) AS total_orders FROM orders');
    const totalOrders = ordersResult.length > 0 ? Number(ordersResult[0].total_orders) : 0;

    // 3. Total Customers using SQL COUNT
    const [customersResult] = await query('SELECT COUNT(*) AS total_customers FROM users WHERE role = "customer"');
    const totalCustomers = customersResult.length > 0 ? Number(customersResult[0].total_customers) : 0;

    // 4. Total Bookings using SQL COUNT
    const [bookingsResult] = await query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const totalBookings = bookingsResult.length > 0 ? Number(bookingsResult[0].total_bookings) : 0;

    // 5. Recent 5 orders using SQL JOIN
    const [recentOrders] = await query(
      `SELECT o.id, o.total, o.status, o.order_date, u.name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalBookings,
      },
      recentOrders,
      dbStatus: getDbStatus()
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
});

// GET /api/dashboard/revenue - Admin Revenue Graph Data for Recharts
router.get('/revenue', verifyToken, isAdmin, async (req, res) => {
  try {
    // Revenue grouped by payment date from payments table where status = 'Paid'
    const [rows] = await query(
      `SELECT substr(payment_date, 1, 10) as date, SUM(amount) as revenue, COUNT(id) as transactions
       FROM payments
       WHERE status = 'Paid'
       GROUP BY substr(payment_date, 1, 10)
       ORDER BY date ASC`
    );

    // If empty, return a reasonable baseline for the chart
    let revenueData = rows.map(r => ({
      date: r.date,
      revenue: Number(r.revenue),
      transactions: Number(r.transactions)
    }));

    if (revenueData.length === 0) {
      revenueData = [
        { date: 'Initial', revenue: 0, transactions: 0 }
      ];
    }

    res.json({ success: true, revenueData });
  } catch (error) {
    console.error('Fetch revenue graph error:', error);
    res.status(500).json({ success: false, message: 'Failed to load revenue data.' });
  }
});

export default router;
