// db.js
const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',    // e.g., 'root'
  password: '1234',
  database: 'vibehive'
});

// Connect and check
connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL DB as ID', connection.threadId);
});

module.exports = connection;
