import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// GET /api/cameras (DB連携)
app.get('/api/cameras', async (req: Request, res: Response) => {
  try {
    const cameras = await prisma.camera.findMany();
    res.json(cameras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

// POST /api/cameras (DB連携: カメラ追加)
app.post('/api/cameras', async (req: Request, res: Response) => {
  try {
    const { name, ip } = req.body;
    if (!name || !ip) {
      return res.status(400).json({ error: 'name and ip are required' });
    }
    const camera = await prisma.camera.create({
      data: { name, ip }
    });
    res.status(201).json(camera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create camera' });
  }
});

// POST /api/streams (映像ストリーム受信: Collectorサービス基礎)
app.post('/api/streams', async (req: Request, res: Response) => {
  try {
    const { cameraId, url, meta } = req.body;
    if (!cameraId || !url) {
      return res.status(400).json({ error: 'cameraId and url are required' });
    }
    // cameraIdの存在チェック
    const camera = await prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    const stream = await prisma.stream.create({
      data: {
        cameraId,
        url,
        meta: meta || undefined
      }
    });
    res.status(201).json(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create stream' });
  }
});

// GET /api/streams?cameraId=xxx (カメラ別ストリーム一覧取得)
app.get('/api/streams', async (req: Request, res: Response) => {
  try {
    const { cameraId } = req.query;
    const where = cameraId ? { cameraId: String(cameraId) } : {};
    const streams = await prisma.stream.findMany({ where });
    res.json(streams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

// POST /api/sessions (DB連携)
app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    const userName = req.body.user || 'guest';
    // ユーザーをfind or create
    const user = await prisma.user.upsert({
      where: { name: userName },
      update: {},
      create: { name: userName }
    });
    // セッション作成
    const session = await prisma.session.create({
      data: { userId: user.id }
    });
    res.json({ sessionId: session.id, user: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/token?cameraId=xxx
app.get('/api/token', (req: Request, res: Response) => {
  const { cameraId } = req.query;
  res.json({ token: `dummy-token-for-${cameraId}` });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`User Session Service listening on port ${port}`);
});
