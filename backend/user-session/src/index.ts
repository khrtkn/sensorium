import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// asyncHandlerラッパー関数
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// GET /api/cameras (DB連携)
app.get('/api/cameras', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cameras = await prisma.camera.findMany();
    res.json(cameras);
  } catch (err) {
    next(err);
  }
}));

// POST /api/cameras (DB連携: カメラ追加)
app.post('/api/cameras', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
    next(err);
  }
}));

// POST /api/streams (映像ストリーム受信: Collectorサービス基礎)
app.post('/api/streams', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cameraId, url, meta } = req.body;
    if (!cameraId || !url) {
      return res.status(400).json({ error: 'cameraId and url are required' });
    }
    // Camera存在チェック
    const camera = await prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    const stream = await prisma.stream.create({
      data: { cameraId, url, meta }
    });
    res.status(201).json(stream);
  } catch (err) {
    next(err);
  }
}));

// GET /api/streams?cameraId=xxx (カメラ別ストリーム一覧取得)
app.get('/api/streams', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cameraId } = req.query;
    const where = cameraId ? { cameraId: String(cameraId) } : {};
    const streams = await prisma.stream.findMany({ where });
    res.json(streams);
  } catch (err) {
    next(err);
  }
}));

// POST /api/sessions (DB連携)
app.post('/api/sessions', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userName = req.body.user || 'guest';
    // ユーザーをfind or create
    let user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) {
      user = await prisma.user.create({ data: { name: userName } });
    }
    const session = await prisma.session.create({ data: { userId: user.id } });
    res.json({ sessionId: session.id, user: user.name });
  } catch (err) {
    next(err);
  }
}));

// GET /api/token?cameraId=xxx
app.get('/api/token', (req: Request, res: Response) => {
  const { cameraId } = req.query;
  res.json({ token: `dummy-token-for-${cameraId}` });
});

// エラーハンドラー
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`User session service listening on port ${port}`);
});
