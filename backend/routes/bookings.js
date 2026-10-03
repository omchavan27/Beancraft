import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/bookings - Customer books a table
router.post('/', verifyToken, async (req, res) => {
  try {
    const { table_no, date, time, guests } = req.body;
    const userId = req.user.id;

    if (!table_no || !date || !time || !guests) {
      return res.status(400).json({ success: false, message: 'Table number, date, time, and guest count are required.' });
    }

    const validTables = ['T1', 'T2', 'T3', 'T4', 'T5'];
    if (!validTables.includes(table_no)) {
      return res.status(400).json({ success: false, message: `Invalid table number. Available tables: ${validTables.join(', ')}` });
    }

    const guestsNum = Math.max(1, parseInt(guests) || 1);

    // Check if table is already booked and Confirmed for the exact date and time
    const [conflict] = await query(
      'SELECT id FROM bookings WHERE table_no = ? AND date = ? AND time = ? AND status = "Confirmed"',
      [table_no, date, time]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Table ${table_no} is already confirmed for ${date} at ${time}. Please choose another time or table.`
      });
    }

    const [result] = await query(
      'INSERT INTO bookings (user_id, table_no, date, time, guests, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, table_no, date, time, guestsNum, 'Pending']
    );

    res.status(201).json({
      success: true,
      message: `Table ${table_no} booked successfully! Status: Pending confirmation.`,
      bookingId: result.insertId,
      booking: {
        id: result.insertId,
        table_no,
        date,
        time,
        guests: guestsNum,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// GET /api/bookings/my - Customer views their bookings
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [bookings] = await query(
      'SELECT id, table_no, date, time, guests, status FROM bookings WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch customer bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load bookings.' });
  }
});

// GET /api/bookings - Admin views all bookings with customer details via JOIN
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [bookings] = await query(
      `SELECT b.id, b.user_id, b.table_no, b.date, b.time, b.guests, b.status,
              u.name as customer_name, u.email as customer_email
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.id DESC`
    );

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch admin bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load bookings.' });
  }
});

// PUT /api/bookings/:id/status - Admin confirms or cancels a booking
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    const [result] = await query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      message: `Booking #${id} status updated to ${status}.`,
      status
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

export default router;
