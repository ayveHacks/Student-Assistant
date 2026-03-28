const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
const controller = require('./controller');

const app = express();
app.use(cors());
app.use(express.json());

// Routes

// 1. Chat Interface
app.post('/api/chat', async (req, res) => {
  const { query, studentId } = req.body;
  
  if (!query || !studentId) {
    return res.status(400).json({ error: 'Query and studentId are required' });
  }

  const requestId = crypto.randomUUID();
  const reply = await controller.processRequest(requestId, studentId, query);
  
  res.json({
    requestId,
    reply: reply.success ? reply.result.message : reply.message,
    details: reply
  });
});

// 2. Ticket APIs (Dashboard)
app.get('/api/tickets', (req, res) => {
  const { assignedTo, status } = req.query;
  
  let q = 'SELECT tickets.*, users.name as student_name, courses.name as course_name FROM tickets JOIN users ON tickets.student_id = users.id LEFT JOIN courses ON tickets.related_entity = courses.id';
  let params = [];

  const filters = [];
  if (assignedTo) {
    filters.push('assigned_to = ?');
    params.push(assignedTo);
  }
  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (filters.length > 0) {
     q += ' WHERE ' + filters.join(' AND ');
  }

  q += ' ORDER BY created_at DESC';

  const tickets = db.prepare(q).all(...params);
  
  // Dashboard Metrics
  const total = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
  const pending = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE status = ?').get('pending').count;
  const resolved = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE status IN (?, ?)').get('approved', 'rejected').count;

  res.json({
    tickets,
    metrics: { total, pending, resolved }
  });
});

app.put('/api/tickets/:id', (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected', 'escalated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const stmt = db.prepare('UPDATE tickets SET status = ? WHERE id = ?');
  const info = stmt.run(status, req.params.id);

  if (info.changes > 0) {
    res.json({ success: true, message: `Ticket ${req.params.id} marked as ${status}` });
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// 3. Logs API
app.get('/api/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100').all();
  res.json(logs);
});

// 4. Users (for mock Auth)
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
