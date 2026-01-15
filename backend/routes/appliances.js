const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Get All appliances
router.get('/', async (req, res) => {
    try {
        const appliances = await all(`
            SELECT
                a.*,
                m.name as started_by_name,
                m.color as started_by_color
            FROM appliances a
            LEFT JOIN members m ON a.started_by = m.id
            ORDER_BY a.name ASC
        `);

        res.json(appliances);
    } catch (error) {
        console.error('Error fetching appliances:', error);
        res.status(500).json({ error: 'Failed to fetch appliances' });
    }
});

// Start using an appliance
router.put('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { started_by, duration_minutes } = req.body;

    // Calculate estimated done time
    const estimatedDoneAt = new Date();
    estimatedDoneAt.setMinutes(estimatedDoneAt.getMinutes() + (duration_minutes || 60));

    await run(
      `UPDATE appliances 
       SET status = 'in_use', 
           started_by = ?, 
           started_at = CURRENT_TIMESTAMP,
           estimated_done_at = datetime('now', '+' || ? || ' minutes')
       WHERE id = ?`,
      [started_by || null, duration_minutes || 60, id]
    );

    const updatedAppliance = await get(`
      SELECT 
        a.*,
        m.name as started_by_name,
        m.color as started_by_color
      FROM appliances a
      LEFT JOIN members m ON a.started_by = m.id
      WHERE a.id = ?
    `, [id]);

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;