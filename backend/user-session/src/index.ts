import express from 'express';

const app = express();
app.use(express.json());

// GET /api/cameras
app.get('/api/cameras', (req, res) => {
  res.json([
    { id: 'cam1', name: 'Camera 1', ip: '192.168.1.10' },
    { id: 'cam2', name: 'Camera 2', ip: '192.168.1.11' }
  ]);
});

// POST /api/sessions
app.post('/api/sessions', (req, res) => {
  res.json({ sessionId: 'dummy-session-id', user: req.body.user || 'guest' });
});

// GET /api/token?cameraId=xxx
app.get('/api/token', (req, res) => {
  const { cameraId } = req.query;
  res.json({ token: `dummy-token-for-${cameraId}` });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`User Session Service listening on port ${port}`);
});
