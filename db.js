const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // your MySQL username
  password: '1234',   // your MySQL password
  database: 'vibehive', // your database name
  waitForConnections:true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
