const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite'

// Generate DB connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Members table
        db.run(`
            CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#3B82F6',
                is_admin BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )    
        `);

        // Shopping items table
        db.run(`
            CREATE TABLE IF NOT EXISTS shopping_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL,
                quantity TEXT,
                added_by INTEGER,
                purchased BOOLEAN DEFAULT 0,
                purchased_by INTEGER,
                purchased_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES members(id),
                FOREIGN KEY (purchased_by) REFERENCES members(id)
            )
        `);

        // Expenses
        db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                paid_by INTEGER,! 
                date DATE NOT NULL,
                category TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paid_by) REFERENCES members(id)
            )
        `);

        // Expenses split
        db.run(`
            CREATE TABLE IF NOT EXISTS expense_splits (
                id INTEGERE PRIMARY KEY AUTOINCREMENT,
                expense_id INTEGER NOT NULL,
                member_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (expense_id) REFERENCES expenses(id),
                FOREIGN KEY (member_id) REFERENCES members(id)
            )
        `);

        // Appliances
        db.run(`
            CREATE TABLE IF NOT EXISTS appliances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                status TEXT DEFAULT 'available',
                started_by INTEGER,
                started_at DATETIME,
                FOREIGN KEY (started_by) REFERENCES members(id)
            )
        `);

        // Insert default appliances
        db.run(`
            INSERT OR IGNORE INTO appliances (name, status)
            VALUES ('Washer', 'available'), ('Dryer', 'available')    
        `);

        console.log('Database tables initialized')
    });
}

// Helper function to run queries with promises
function run (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    db,
    initDatabase,
    run,
    get,
    all
};