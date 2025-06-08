// server.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'vibehive'
});

connection.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Serve a simple form to add users
app.get('/', (req, res) => {
  res.send(`
    <h1>Add User</h1>
    <form method="POST" action="/add-user">
      Username: <input name="username" /><br/>
      Password: <input name="password" /><br/>
      Email: <input name="email" /><br/>
      <button type="submit">Add User</button>
    </form>
    <hr/>
    <a href="/users">Show All Users</a>
  `);
});

// Insert user data into MySQL
app.post('/add-user', (req, res) => {
  const { username, password, email } = req.body;
  const sql = 'INSERT INTO user (username, password, email) VALUES (?, ?, ?)';
  connection.query(sql, [username, password, email], (err, result) => {
    if (err) {
      return res.send('Error inserting user: ' + err.message);
    }
    res.send('User added successfully! <a href="/">Go back</a>');
  });
});

// Show all users
app.get('/users', (req, res) => {
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      return res.send('Error fetching users: ' + err.message);
    }
    let html = '<h1>Users List</h1><ul>';
    results.forEach(user => {
      html += `<li>${user.id} - ${user.username} - ${user.email} - Created at: ${user.created_at}</li>`;
    });
    html += '</ul><a href="/">Add more users</a>';
    res.send(html);
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
