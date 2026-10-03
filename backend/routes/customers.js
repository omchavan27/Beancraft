import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers - Admin views all customers with total order count using JOIN and COUNT
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [customers] = await query(
      `SELECT u.id, u.name, u.email, u.created_at,
              COUNT(o.id) AS total_orders
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email, u.created_at
       ORDER BY u.id ASC`
    );

    res.json({ success: true, customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
});

export default router;
