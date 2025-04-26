import express from 'express';
import { spawn } from 'child_process';
import { createC2pa, ManifestBuilder } from 'c2pa-node';

const app = express();
const PORT = process.env.PORT || 8001;
const LIVEKIT_RTMP_URL = process.env.LIVEKIT_RTMP_URL || 'rtmp://localhost:1935/app/stream';
const c2pa = createC2pa();

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

app.post('/metadata', express.json(), async (req, res) => {
  const metadata = req.body;
  console.log('Metadata received:', metadata);
  const manifest = new ManifestBuilder({
    claim_generator: 'sensorium/transcoder',
    format: 'application/json',
    title: `metadata-${Date.now()}.json`,
    assertions: [
      { label: 'com.sensorium.metadata', data: metadata }
    ]
  });
  const buffer = Buffer.from(JSON.stringify(metadata));
  const signedBuffer = await c2pa.sign({ manifest, data: buffer });
  console.log('Signed metadata length:', signedBuffer.byteLength);
  res.json({ signedLength: signedBuffer.byteLength });
});

app.listen(PORT, () => console.log(`Transcoder service listening on port ${PORT}`));
