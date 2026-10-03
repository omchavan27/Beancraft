import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/payments - Customer records a payment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { order_id, amount, method } = req.body;
    const userId = req.user.id;

    if (!order_id || !method) {
      return res.status(400).json({ success: false, message: 'Order ID and payment method are required.' });
    }

    const validMethods = ['Cash', 'UPI', 'Card'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: 'Payment method must be Cash, UPI, or Card.' });
    }

    // Verify order exists and belongs to the user (or admin)
    const [orders] = await query('SELECT id, user_id, total, status FROM orders WHERE id = ?', [order_id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    if (req.user.role !== 'admin' && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
    }

    // Check if already paid
    const [existing] = await query('SELECT id FROM payments WHERE order_id = ? AND status = "Paid"', [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Payment for this order has already been completed.' });
    }

    const paymentAmount = amount !== undefined ? Number(amount) : Number(order.total);

    // Insert payment record
    const [result] = await query(
      'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
      [order_id, paymentAmount, method, 'Paid']
    );

    res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount} via ${method} recorded successfully!`,
      paymentId: result.insertId,
      order_id,
      amount: paymentAmount,
      method,
      status: 'Paid'
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
});

// GET /api/payments - Admin retrieves all payments with Customer details and Total Revenue
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // 1. Fetch payments list with SQL JOIN
    const [payments] = await query(
      `SELECT p.id, p.order_id, p.amount, p.method, p.status, p.payment_date,
              o.user_id, u.name as customer_name, u.email as customer_email
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN users u ON o.user_id = u.id
       ORDER BY p.id DESC`
    );

    // 2. Calculate total revenue using SQL SUM
    const [sumResult] = await query(
      'SELECT SUM(amount) AS total_revenue FROM payments WHERE status = "Paid"'
    );
    const totalRevenue = sumResult.length > 0 && sumResult[0].total_revenue ? Number(sumResult[0].total_revenue) : 0;

    res.json({
      success: true,
      totalRevenue,
      payments
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to load payments.' });
  }
});

// GET /api/payments/my - Customer retrieves their payment history
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [payments] = await query(
      `SELECT p.id, p.order_id, p.amount, p.method, p.status, p.payment_date
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY p.id DESC`,
      [userId]
    );

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Fetch customer payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to load payments.' });
  }
});

export default router;
