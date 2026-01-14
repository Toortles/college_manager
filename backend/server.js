const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const shoppingRoutes = require('./routes/shopping');
const expensesRoutes = require('./routes/expenses');
const eventsRoutes = require('./routes/events');
const appliancesRoutes = require('./routes/appliances');
const membersRoutes = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
db.initDatabase();

// Health Check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Household Hub API is running!' });
});

// Routes
app.use('/api/shopping', shoppingRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/appliances', appliancesRoutes);
app.use('/api/members', membersRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.err(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server - listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Access locally at http://localhost:${PORT}`);
    console.log(`Access from the network at http://192.168.1.163:${PORT}`);
})