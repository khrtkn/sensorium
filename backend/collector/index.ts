import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { cameras } from './config';
import { Kafka } from 'kafkajs';

const TRANSCODER_URL = process.env.TRANSCODER_URL || 'http://localhost:8001';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'streams.metadata';

const kafka = new Kafka({ brokers: [KAFKA_BROKER] });
const producer = kafka.producer();

async function sendMetadata(cameraId: string, metadata: any) {
  try {
    const payload = { cameraId, metadata, timestamp: new Date().toISOString() };
    const res = await fetch(`${TRANSCODER_URL}/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Metadata send failed for ${cameraId}:`, res.statusText);
    }
    await producer.send({
      topic: KAFKA_TOPIC,
      messages: [{ key: cameraId, value: JSON.stringify(payload) }],
    });
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

async function main() {
  await producer.connect();
  cameras.forEach(camera => {
    startStream(camera);
    setInterval(() => sendMetadata(camera.id, camera.metadata), 1000);
  });
}

main();
