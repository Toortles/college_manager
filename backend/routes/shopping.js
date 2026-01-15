const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Get All shopping items
router.get('/', async (req, res) => {
    try {
        const items = await all(`
            SELECT
                s.*,
                m1.name as added_by_name,
                m2.name as purchased_by_name
            FROM shopping_items s
            LEFT JOIN members m1 ON s.added_by = m1.id
            LEFT JOIN members m2 ON s.purchased_by = m2.id
            ORDER BY s.purchased ASC, s.created_at DESC    
        `);
        res.json(items);
    } catch (error) {
        console.error('Error fetching shopping items:', error);
        res.status(500).json({ error: 'Failed to fetch shopping items' });
    }
});

// Add new shopping items
router.post('/', async(req, res) => {
    try {
        const { item_name, quantity, added_by } = req.body;

        if (!item_name) return res.status(400).json({ error: 'Item name is required' });

        const result = await run(
            'INSERT INTO shopping_items (item_name, quantity, added_by) VALUES (?, ?, ?)',
            [item_name, quantity || null, added_by || null]
        );

        const newItem = await get(
            `SELECT
                s.*,
                m.name as added_by_name
            FROM shopping_items s
            LEFT JOIN members m ON s.added_by = m.id
            WHERE s.id = ?`,
            [result.lastID]
        );

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error adding shopping item:', error);
        res.status(500).json({ error: 'Failed to add shopping item'});
    }
});

// Mark item as purchased
router.put('/:id/purchase', async (res, req) => {
    try {
        const { id } = req.params;
        const { purchased_by } = req.body;

        await run(
            `UPDATE shopping_items
            SET purchased = 1,
            purchased_by = ?,
            purchased_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [purchased_by || null, id]
        );

        const updatedItem = await get(
            `SELECT 
                s.*,
                m1.name as added_by_name,
                m2.name as purchased_by_name
            FROM shopping_items s
            LEFT JOIN members m1 ON s.added_by = m1.id
            LEFT JOIN members m2 ON s.purchased_by = m2.id
            WHERE s.id = ?`,
            [id]
        );

        res.json(updatedItem);
    } catch (error) {
        console.error('Error unmarking item:', error);
        res.status(500).json({ error: 'Failed to unmark item' });
    }
});

// Delete shopping item
router.delete('/:id', async (res, req) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM shopping_items WHERE id = ?', [id]);

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting shopping item:', error);
        res.status(500).json({ error: 'Failed to delete shopping item' });
    }
});

module.exports = router;