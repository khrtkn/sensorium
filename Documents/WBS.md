# Work Breakdown Structure (WBS)

プロジェクト要件（`requirements.md`）、フロントエンド設計（`frontend.md`）、バックエンド設計（`backend.md`）を達成するためのタスク分解。

## 1. Backend Implementation
1.1 インフラ構築
  - Kubernetes クラスター & GPU ノード
  - Terraform + Helm Charts
1.2 Collector Service
  - RTSP/HLS ポーリング実装
  - 映像＋メタデータ送信（HTTP/Kafka）
1.3 Transcoder & C2PA Signing
  - GPU トランスコード (AV1/Opus)
  - c2pa-node 署名
  - LiveKit ingest 送信
1.4 Slicer Service
  - HLS v4 マニフェスト & セグメント生成
  - IPFS + Arweave ピン留め
  - Cloudflare R2 への短期キャッシュ設定
1.5 LiveKit SFU & Token Service
  - LiveKit SFU デプロイ
  - JWT スコープ付きトークン API 実装
1.6 Metadata Aggregator
  - OpenWeather, SNS API ポーリング
  - Sentiment ML 処理
  - Redis Pub/Sub で 1Hz 配信用
1.7 WebTransport Server
  - `/api/metadata` HTTP/3 サーバ実装
  - HTTP/2 SSE / WebSocket フォールバック
1.8 User Session & Token API
  - GET `/api/cameras` (IP制限/APIキー)
  - POST `/api/sessions`
  - GET `/api/token?cameraId=`
  - PostgreSQL モデル／マイグレーション
1.9 モニタリング & CI/CD (Backend)
  - GitHub Actions: lint, type-check, Docker build, Helm deploy
  - Prometheus, Grafana, Loki 導入
  - ESLint, Prettier, Commitlint 組み込み

## 2. Frontend Implementation
2.1 プロジェクトセットアップ
  - React + TypeScript スキャフォールド
  - 依存ライブラリ導入（Three.js, c2pa-js, LiveKit, WebTransport）
2.2 UI & State Management
  - Chakra UI / Material UI
  - Redux Toolkit or Zustand 設定
2.3 AuthBadge Component
  - useC2PA フック実装
  - 検証結果キャッシュ (1–5 分)
2.4 StreamPlayer Component
  - useWebRTC フック統合
  - HLS フォールバック実装
2.5 DataOverlay Component
  - WebTransport クライアント実装
  - SSE/WebSocket フォールバック
2.6 GlobeView Component
  - Three.js WebGPU Renderer
  - randomView アルゴリズム統合
2.7 GroupSessionSync Component
  - useGroupSessionSync フック実装
  - LiveKit DataChannel タイムコード同期
2.8 FaceBlur Util
  - WASM OpenCV 統合
  - パフォーマンス最適化 (ダウンサンプリング)
2.9 Fallback Renderer
  - Three.js WebGL2 実装 (WebGPU 非対応環境)
2.10 モニタリング & CI/CD (Frontend)
  - GitHub Actions: lint, type-check, build, preview
  - ESLint, Prettier, Commitlint 組み込み

## 3. Integration & Deployment
3.1 Docker & docker-compose 設定
3.2 Kubernetes マニフェスト & Helm Charts
3.3 Terraform インフラプロビジョニング
3.4 フロントエンド: Vercel/Netlify デプロイ
3.5 バックエンド: Kubernetes デプロイ
3.6 ロードテスト & ベンチマーク (K6/Locust, WebGPU fps)
3.7 ドキュメント整備 (README, OpenAPI/Swagger)
