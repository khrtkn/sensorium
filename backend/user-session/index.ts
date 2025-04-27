import express from 'express';
import { Pool } from 'pg';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8005;
const API_KEY = process.env.API_KEY || '';
const LIVEKIT_TOKEN_URL = process.env.LIVEKIT_TOKEN_URL || 'http://localhost:8004/token';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY,
      camera_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// API key middleware
app.use((req, res, next) => {
  const key = req.header('x-api-key');
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
});

// Static camera config (could be seeded into DB)
const cameras = [
  { id: 'cam1', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', latitude: 35.6895, longitude: 139.6917 }
];

app.get('/api/cameras', (req, res) => {
  res.json(cameras);
});

app.post('/api/sessions', async (req, res) => {
  const { cameraId } = req.body;
  if (!cameraId) {
    return res.status(400).json({ error: 'cameraId is required' });
  }
  const sessionId = uuidv4();
  await pool.query('INSERT INTO sessions(id, camera_id) VALUES($1, $2)', [sessionId, cameraId]);
  res.json({ sessionId, cameraId });
});

app.get('/api/token', async (req, res) => {
  const cameraId = req.query.cameraId as string;
  if (!cameraId) {
    return res.status(400).json({ error: 'cameraId is required' });
  }
  try {
    const tokenRes = await fetch(`${LIVEKIT_TOKEN_URL}?cameraId=${cameraId}`);
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: 'Token API error' });
    }
    const tokenJson = await tokenRes.json();
    res.json(tokenJson);
  } catch (err) {
    console.error('Token proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`User Session Service on port ${PORT}`)))
  .catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
