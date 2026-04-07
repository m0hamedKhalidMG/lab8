'use strict';

const express = require('express');
const { Pool } = require('pg');
const os = require('os');

const app = express();
const PORT = 3000;

// Connect to PostgreSQL using the DATABASE_URL environment variable.
// In Docker Compose the hostname is the service name "db".
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Route 1: basic info
app.get('/', (req, res) => {
  res.json({
    app:  'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname(),
  });
});

// Route 2: tasks grouped by status, read from PostgreSQL
app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, status FROM tasks ORDER BY id');

    // Group rows by status (compatible with all Node versions)
    const grouped = rows.reduce((acc, task) => {
      (acc[task.status] = acc[task.status] || []).push(task);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`  CISC 886 Lab 8 — App started`);
  console.log(`  Port:  ${PORT}`);
  console.log(`  Mode:  ${process.env.MODE || 'local'}`);
  console.log(`  Node:  ${process.version}`);
  console.log(`  Host:  ${os.hostname()}`);
  console.log('--------------------------------------------------');
});
