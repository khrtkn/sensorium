import express from 'express';
import { spawn } from 'child_process';
// TODO: Integrate c2pa-node for frame-level signing

const app = express();
const PORT = process.env.PORT || 8001;
const LIVEKIT_RTMP_URL = process.env.LIVEKIT_RTMP_URL || 'rtmp://localhost:1935/app/stream';

app.post('/stream/:cameraId', (req, res) => {
  const { cameraId } = req.params;
  console.log(`Transcoding stream for ${cameraId}`);
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-c:v', 'libaom-av1',
    '-cpu-used', '4',
    '-crf', '30',
    '-b:v', '0',
    '-c:a', 'libopus',
    '-f', 'flv',
    LIVEKIT_RTMP_URL
  ]);

  req.pipe(ffmpeg.stdin);
  ffmpeg.stderr.on('data', (data) => console.error(`[ffmpeg ${cameraId}] ${data}`));
  ffmpeg.on('exit', (code) => {
    console.warn(`ffmpeg exited with code ${code} for ${cameraId}`);
  });

  res.status(200).send('ok');
});

app.post('/metadata', express.json(), (req, res) => {
  // Metadata posted from Collector, forward to clients or store
  console.log('Metadata received:', req.body);
  res.status(200).end();
});

app.listen(PORT, () => console.log(`Transcoder service listening on port ${PORT}`));
