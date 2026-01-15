const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Get all expenses with splits
router.get('/', async (req, res) => {
  try {
    const expenses = await all(`
      SELECT 
        e.*,
        m.name as paid_by_name,
        m.color as paid_by_color
      FROM expenses e
      LEFT JOIN members m ON e.paid_by = m.id
      ORDER BY e.date DESC, e.created_at DESC
    `);

    // Get splits for each expense
    for (let expense of expenses) {
      expense.splits = await all(`
        SELECT 
          es.*,
          m.name as member_name,
          m.color as member_color
        FROM expense_splits es
        LEFT JOIN members m ON es.member_id = m.id
        WHERE es.expense_id = ?
      `, [expense.id]);
    }

    res.json(expenses);
    
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get balance summary (who owes who)
router.get('/balance', async (req, res) => {
  try {
    // Get all members
    const members = await all('SELECT id, name, color FROM members');
    
    // Calculate balances
    const balances = {};
    for (let member of members) {
      balances[member.id] = {
        id: member.id,
        name: member.name,
        color: member.color,
        paid: 0,
        owes: 0,
        balance: 0
      };
    }

    // Sum up what each person paid
    const payments = await all(`
      SELECT paid_by, SUM(amount) as total_paid
      FROM expenses
      GROUP BY paid_by
    `);
    
    for (let payment of payments) {
      if (balances[payment.paid_by]) {
        balances[payment.paid_by].paid = parseFloat(payment.total_paid);
      }
    }

    // Sum up what each person owes
    const debts = await all(`
      SELECT member_id, SUM(amount) as total_owes
      FROM expense_splits
      GROUP BY member_id
    `);
    
    for (let debt of debts) {
      if (balances[debt.member_id]) {
        balances[debt.member_id].owes = parseFloat(debt.total_owes);
      }
    }

    // Calculate net balance
    Object.values(balances).forEach(member => {
      member.balance = member.paid - member.owes;
    });

    res.json(Object.values(balances));

  } catch (error) {
    console.error('Error calculating balance:', error);
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

// Add new expense
router.post('/', async (req, res) => {
  try {
    const { description, amount, paid_by, date, category, splits } = req.body;
    
    if (!description || !amount || !paid_by || !splits || splits.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert expense
    const result = await run(
      'INSERT INTO expenses (description, amount, paid_by, date, category) VALUES (?, ?, ?, ?, ?)',
      [description, amount, paid_by, date || new Date().toISOString().split('T')[0], category || 'general']
    );

    const expenseId = result.lastID;

    // Insert splits
    for (let split of splits) {
      await run(
        'INSERT INTO expense_splits (expense_id, member_id, amount) VALUES (?, ?, ?)',
        [expenseId, split.member_id, split.amount]
      );
    }

    // Fetch the complete expense with splits
    const newExpense = await get(`
      SELECT 
        e.*,
        m.name as paid_by_name,
        m.color as paid_by_color
      FROM expenses e
      LEFT JOIN members m ON e.paid_by = m.id
      WHERE e.id = ?
    `, [expenseId]);

    newExpense.splits = await all(`
      SELECT 
        es.*,
        m.name as member_name,
        m.color as member_color
      FROM expense_splits es
      LEFT JOIN members m ON es.member_id = m.id
      WHERE es.expense_id = ?
    `, [expenseId]);

    res.status(201).json(newExpense);

  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete splits first (foreign key constraint)
    await run('DELETE FROM expense_splits WHERE expense_id = ?', [id]);
    
    // Delete expense
    await run('DELETE FROM expenses WHERE id = ?', [id]);
    
    res.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;