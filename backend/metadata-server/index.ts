import express from 'express';
import expressWs from 'express-ws';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '8003');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(REDIS_URL);

// Setup Express with WebSocket support
const appBase = express();
const { app, getWss } = expressWs(appBase);

// SSE endpoint fallback
app.get('/api/metadata/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  const sub = new Redis(REDIS_URL);
  sub.subscribe('sensorium', () => {
    sub.on('message', (_chan, msg) => {
      res.write(`data: ${msg}\n\n`);
    });
  });
  req.on('close', () => {
    sub.quit();
  });
});

// WebSocket fallback
app.ws('/ws/metadata', (ws, req) => {
  const sub = new Redis(REDIS_URL);
  sub.subscribe('sensorium', () => {
    sub.on('message', (_chan, msg) => {
      ws.send(msg);
    });
  });
  ws.on('close', () => sub.quit());
});

// TODO: Implement WebTransport over HTTP/3 endpoint
app.all('/api/metadata', (req, res) => {
  res.status(426).json({ error: 'Upgrade to WebTransport or use fallback /sse or /ws' });
});

app.listen(PORT, () => console.log(`Metadata Server listening on port ${PORT}`));
