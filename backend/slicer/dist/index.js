"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ipfs_http_client_1 = require("ipfs-http-client");
const arweave_1 = __importDefault(require("arweave"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8002;
const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || '';
const ARWEAVE_HOST = process.env.ARWEAVE_HOST || 'arweave.net';
const ARWEAVE_KEY = process.env.ARWEAVE_KEY || '';
const ipfs = (0, ipfs_http_client_1.create)({ url: IPFS_URL });
const arweave = arweave_1.default.init({
    host: ARWEAVE_HOST,
    port: 443,
    protocol: 'https'
});
const s3 = new aws_sdk_1.default.S3({
    endpoint: R2_ENDPOINT,
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
    signatureVersion: 'v4'
});
app.post('/slice/:cameraId', (req, res) => {
    const cameraId = req.params.cameraId;
    const outDir = path_1.default.resolve(__dirname, '../../hls', cameraId);
    fs_1.default.mkdirSync(outDir, { recursive: true });
    const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-i', 'pipe:0',
        '-c', 'copy',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments',
        path_1.default.join(outDir, 'index.m3u8')
    ]);
    req.pipe(ffmpeg.stdin);
    ffmpeg.stderr.on('data', data => console.error(`[hls ${cameraId}] ${data}`));
    ffmpeg.on('exit', async (code) => {
        console.warn(`HLS slicing exited for ${cameraId} (code ${code})`);
        // Pin files to IPFS and Arweave, upload to R2
        const files = fs_1.default.readdirSync(outDir);
        for (const file of files) {
            const filePath = path_1.default.join(outDir, file);
            const data = fs_1.default.readFileSync(filePath);
            // IPFS
            await ipfs.add(data).then(res => console.log(`IPFS: ${file} -> ${res.path}`));
            // Arweave
            const tx = await arweave.createTransaction({ data });
            tx.addTag('Content-Type', 'application/octet-stream');
            await arweave.transactions.sign(tx, JSON.parse(ARWEAVE_KEY));
            await arweave.transactions.post(tx);
            console.log(`Arweave: ${file} -> ${tx.id}`);
            // Cloudflare R2
            await s3.putObject({ Bucket: 'sensorium-hls', Key: `${cameraId}/${file}`, Body: data, ACL: 'public-read' }).promise();
            console.log(`R2: uploaded ${file}`);
        }
    });
    res.status(200).send('slicing started');
});
app.listen(PORT, () => console.log(`Slicer service listening on port ${PORT}`));
