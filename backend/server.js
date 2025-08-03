const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Connect to SQLite database
const db = new sqlite3.Database('./feedback.db', (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create feedback table
db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
  const sql = 'SELECT * FROM feedback ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// Add new feedback
app.post('/api/feedback', (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO feedback (title, content, author) VALUES (?, ?, ?)';
  db.run(sql, [title, content, author], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database insert error' });
    }

    res.status(201).json({
      success: true,
      data: {
        id: this.lastID,
        title,
        content,
        author,
        timestamp: new Date().toISOString()
      },
      message: 'Feedback added successfully'
    });
  });
});

// Delete feedback by ID
app.delete('/api/feedback/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM feedback WHERE id = ?';

  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Delete error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, message: 'Feedback deleted' });
  });
});

// GROQ LLM API Integration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const axios = require('axios');
require('dotenv').config();

app.post('/api/ai/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: question }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date().toISOString(),
        model: 'llama3-8b-8192'
      }
    });

  } catch (error) {
    console.error('Groq API error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch answer from Groq API' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
