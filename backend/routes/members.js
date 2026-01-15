const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await all('SELECT * FROM members ORDER BY name ASC');
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get single member
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const member = await get('SELECT * FROM members WHERE id = ?', [id]);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Add new member
router.post('/', async (req, res) => {
  try {
    const { name, color, is_admin } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await run(
      'INSERT INTO members (name, color, is_admin) VALUES (?, ?, ?)',
      [name, color || '#3B82F6', is_admin ? 1 : 0]
    );

    const newMember = await get('SELECT * FROM members WHERE id = ?', [result.lastID]);

    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, is_admin } = req.body;

    await run(
      'UPDATE members SET name = ?, color = ?, is_admin = ? WHERE id = ?',
      [name, color, is_admin ? 1 : 0, id]
    );

    const updatedMember = await get('SELECT * FROM members WHERE id = ?', [id]);

    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM members WHERE id = ?', [id]);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;