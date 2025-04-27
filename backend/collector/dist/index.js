"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const child_process_1 = require("child_process");
const config_1 = require("./config");
const TRANSCODER_URL = process.env.TRANSCODER_URL || 'http://localhost:8001';
async function sendMetadata(cameraId, metadata) {
    try {
        const res = await (0, node_fetch_1.default)(`${TRANSCODER_URL}/metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cameraId, metadata, timestamp: new Date().toISOString() }),
        });
        if (!res.ok) {
            console.error(`Metadata send failed for ${cameraId}:`, res.statusText);
        }
    }
    catch (err) {
        console.error(`Metadata send error for ${cameraId}:`, err);
    }
}
function startStream(camera) {
    console.log(`Starting stream for ${camera.id} from ${camera.url}`);
    const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
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
    config_1.cameras.forEach(camera => {
        startStream(camera);
        setInterval(() => sendMetadata(camera.id, camera.metadata), 1000);
    });
}
main();
