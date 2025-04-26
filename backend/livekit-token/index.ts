import express from 'express';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Error: LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set');
  process.exit(1);
}

app.get('/token', (req, res) => {
  const cameraId = req.query.cameraId as string;
  if (!cameraId) {
    return res.status(400).json({ error: 'cameraId is required' });
  }
  const identity = (req.query.identity as string) || `user_${cameraId}_${Date.now()}`;
  const at = new AccessToken(API_KEY, API_SECRET, { identity });
  const grant = new VideoGrant({ room: cameraId });
  at.addGrant(grant);
  at.setTtl(3600);
  const token = at.toJwt();
  res.json({ token, identity });
});

app.listen(PORT, () => {
  console.log(`LiveKit Token Service listening on port ${PORT}`);
});
