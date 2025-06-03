const express = require('express');
const app = express();
const db = require('./db');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Sample: Fetch all messages from DB
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
