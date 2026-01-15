const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await all(`
      SELECT 
        e.*,
        m.name as host_name,
        m.color as host_color
      FROM events e
      LEFT JOIN members m ON e.host_member_id = m.id
      ORDER BY e.start_datetime ASC
    `);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await all(`
      SELECT 
        e.*,
        m.name as host_name,
        m.color as host_color
      FROM events e
      LEFT JOIN members m ON e.host_member_id = m.id
      WHERE e.start_datetime >= datetime('now')
      ORDER BY e.start_datetime ASC
      LIMIT 10
    `);
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Add new event
router.post('/', async (req, res) => {
  try {
    const { title, host_member_id, start_datetime, end_datetime, guest_count, notes } = req.body;
    
    if (!title || !start_datetime) {
      return res.status(400).json({ error: 'Title and start time are required' });
    }

    const result = await run(
      `INSERT INTO events 
       (title, host_member_id, start_datetime, end_datetime, guest_count, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, host_member_id || null, start_datetime, end_datetime || null, guest_count || 0, notes || null]
    );

    const newEvent = await get(`
      SELECT 
        e.*,
        m.name as host_name,
        m.color as host_color
      FROM events e
      LEFT JOIN members m ON e.host_member_id = m.id
      WHERE e.id = ?
    `, [result.lastID]);

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, host_member_id, start_datetime, end_datetime, guest_count, notes } = req.body;

    await run(
      `UPDATE events 
       SET title = ?, host_member_id = ?, start_datetime = ?, 
           end_datetime = ?, guest_count = ?, notes = ?
       WHERE id = ?`,
      [title, host_member_id, start_datetime, end_datetime, guest_count, notes, id]
    );

    const updatedEvent = await get(`
      SELECT 
        e.*,
        m.name as host_name,
        m.color as host_color
      FROM events e
      LEFT JOIN members m ON e.host_member_id = m.id
      WHERE e.id = ?
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