import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders - Customer places an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items } = req.body; // array of { menu_id, quantity }
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty. Please add items.' });
    }

    // Validate items and fetch prices from database to calculate real total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const [menuRows] = await query('SELECT id, name, price, available FROM menu WHERE id = ?', [item.menu_id]);
      if (menuRows.length === 0) {
        return res.status(400).json({ success: false, message: `Menu item #${item.menu_id} does not exist.` });
      }
      const menuItem = menuRows[0];
      if (menuItem.available === 0) {
        return res.status(400).json({ success: false, message: `Item "${menuItem.name}" is currently unavailable.` });
      }

      const itemTotal = Number(menuItem.price) * quantity;
      total += itemTotal;
      validatedItems.push({
        menu_id: menuItem.id,
        quantity,
        price: menuItem.price,
      });
    }

    // 1. Insert order into `orders`
    const [orderResult] = await query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [userId, total, 'Pending']
    );

    const orderId = orderResult.insertId;

    // 2. Insert items into `order_items`
    for (const vItem of validatedItems) {
      await query(
        'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, vItem.menu_id, vItem.quantity, vItem.price]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      total,
      status: 'Pending'
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

// GET /api/orders/my - Customer fetches their own orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch customer's orders
    const [orders] = await query(
      'SELECT id, user_id, total, status, order_date FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    // Fetch order items with menu names for each order
    for (const order of orders) {
      const [items] = await query(
        `SELECT oi.id, oi.menu_id, oi.quantity, oi.price, m.name as item_name, m.image as item_image
         FROM order_items oi
         JOIN menu m ON oi.menu_id = m.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;

      // Check payment status for this order
      const [payments] = await query('SELECT id, amount, method, status FROM payments WHERE order_id = ?', [order.id]);
      order.payment = payments.length > 0 ? payments[0] : null;
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to load your orders.' });
  }
});

// GET /api/orders - Admin fetches all orders with customer names via SQL JOIN
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [orders] = await query(
      `SELECT o.id, o.user_id, o.total, o.status, o.order_date,
              u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC`
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await query(
        `SELECT oi.id, oi.menu_id, oi.quantity, oi.price, m.name as item_name
         FROM order_items oi
         JOIN menu m ON oi.menu_id = m.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;

      // Also get payment info
      const [payments] = await query('SELECT id, method, status FROM payments WHERE order_id = ?', [order.id]);
      order.payment = payments.length > 0 ? payments[0] : null;
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to load orders.' });
  }
});

// PUT /api/orders/:id/status - Admin updates order status
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    const [result] = await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      status
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

export default router;
