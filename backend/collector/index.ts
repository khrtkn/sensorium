import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { cameras } from './config';

const TRANSCODER_URL = process.env.TRANSCODER_URL || 'http://localhost:8001';

async function sendMetadata(cameraId: string, metadata: any) {
  try {
    const res = await fetch(`${TRANSCODER_URL}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cameraId, metadata, timestamp: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error(`Metadata send failed for ${cameraId}:`, res.statusText);
    }
  } catch (err) {
    console.error(`Metadata send error for ${cameraId}:`, err);
  }
}

function startStream(camera: typeof cameras[0]) {
  console.log(`Starting stream for ${camera.id} from ${camera.url}`);
  const ffmpeg = spawn('ffmpeg', [
    '-i', camera.url,
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-f', 'flv',
    `${TRANSCODER_URL}/stream/${camera.id}`,
  ]);

  ffmpeg.stdout.on('data', data => console.log(`[ffmpeg ${camera.id} stdout] ${data}`));
  ffmpeg.stderr.on('data', data => console.error(`[ffmpeg ${camera.id} stderr] ${data}`));
  ffmpeg.on('exit', (code, signal) => {
    console.warn(`ffmpeg process for ${camera.id} exited with code ${code} (${signal}). Restarting...`);
    setTimeout(() => startStream(camera), 5000);
  });
}

function main() {
  cameras.forEach(camera => {
    startStream(camera);
    setInterval(() => sendMetadata(camera.id, camera.metadata), 1000);
  });
}

main();
