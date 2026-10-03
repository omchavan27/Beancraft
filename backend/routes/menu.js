import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    // If all=true (for admin), return all items; else return only available items
    let sql = 'SELECT * FROM menu ORDER BY id ASC';
    if (all !== 'true') {
      sql = 'SELECT * FROM menu WHERE available = 1 ORDER BY id ASC';
    }
    const [items] = await query(sql);
    res.json({ success: true, menu: items });
  } catch (error) {
    console.error('Fetch menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve menu items.' });
  }
});

// POST /api/menu - Admin adds new food item
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, available } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Item name and price are required.' });
    }

    const defaultImg = image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
    const isAvail = available !== undefined ? (available ? 1 : 0) : 1;

    const [result] = await query(
      'INSERT INTO menu (name, description, price, image, available) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || '', Number(price), defaultImg, isAvail]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully!',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu item.' });
  }
});

// PUT /api/menu/:id - Admin updates existing food item
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, available } = req.body;

    // Check if exists
    const [existing] = await query('SELECT * FROM menu WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedPrice = price !== undefined ? Number(price) : current.price;
    const updatedImage = image !== undefined ? image : current.image;
    const updatedAvail = available !== undefined ? (available ? 1 : 0) : current.available;

    await query(
      'UPDATE menu SET name = ?, description = ?, price = ?, image = ?, available = ? WHERE id = ?',
      [updatedName, updatedDesc, updatedPrice, updatedImage, updatedAvail, id]
    );

    res.json({ success: true, message: 'Menu item updated successfully!' });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu item.' });
  }
});

// DELETE /api/menu/:id - Admin deletes food item
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item has dependent order_items
    const [orderRefs] = await query('SELECT id FROM order_items WHERE menu_id = ? LIMIT 1', [id]);
    if (orderRefs.length > 0) {
      // Instead of failing due to foreign key RESTRICT, disable the item or let user know
      await query('UPDATE menu SET available = 0 WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Item has existing customer order history, so it was marked as unavailable instead of deleted.'
      });
    }

    await query('DELETE FROM menu WHERE id = ?', [id]);
    res.json({ success: true, message: 'Menu item deleted successfully!' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete menu item.' });
  }
});

export default router;
