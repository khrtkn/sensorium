# Work Breakdown Structure (WBS)

プロジェクト要件（`requirements.md`）、フロントエンド設計（`frontend.md`）、バックエンド設計（`backend.md`）を達成するためのタスク分解。

---

## 進捗メモ（2025-04-27 18:10 JST 更新）

### やったこと
- User Session & Token API（GET /api/cameras, POST /api/sessions, GET /api/token?cameraId=）のAPI/DB実装・マイグレーション・動作確認（Prisma＋PostgreSQL連携）
- Collectorサービスとして、HTTP API（/api/streams）でカメラ映像ストリーム＋メタデータの登録・取得機能を実装
- Prismaスキーマの拡張（Camera, Streamモデル追加）とマイグレーション
- APIのバリデーション・エラーハンドリング実装

### わかったこと
- Prisma generatorのoutputはコメントアウト不可、削除が必須
- サーバー再起動しないとAPIエンドポイントの追加・修正が反映されない
- POST /api/streamsでcameraIdの存在チェック・メタデータ(JSON)保存もできる
- カメラ・ストリームの登録・取得APIがCollectorサービスの基盤になる

### 次やること
- Collectorサービス: RTSP/HLSポーリングやKafka連携の設計・実装着手
- Streamデータの削除・編集API追加
- APIドキュメント自動生成（Swagger/OpenAPI）
- 必要に応じてフロントエンド側（ストリーム再生UI、管理UI）の設計・着手
- WBSの進捗に沿って、他サービス（Transcoder、Metadata Aggregator等）との連携も検討

### プロジェクト運用ルール（2025-04-27追加）
- 各タスク・Issueに対応する実装が完了したら、必ず対応するGitHub IssueにPull Request（PR）を作成・紐付けること。
- PRには「やったこと」「わかったこと」「次やること」など進捗メモの要点も記載する。
- PRレビュー・マージ後は、WBSや進捗メモも必ず最新化する。
- Cascade（AIアシスタント）は、Issue駆動で自動的に実装・PR作成・進捗反映を行う。
- ルールや運用フローも必要に応じてWBS冒頭や進捗メモに追記・更新していく。

---

## Backend Implementation 進捗状況
- 1.1 インフラ構築: TerraformによるOCI基盤の自動化は進行中。Helmチャート雛形は存在。K8sクラスタやGPUノードのapply/運用状況は未検証。
- 1.2 Collector Service: ★HTTP APIによるカメラ映像ストリーム＋メタデータ受信・DB保存を実装済み。/api/streamsエンドポイントで登録・取得可能。RTSP/HLSポーリングやKafka連携は未着手。
- 1.3 Transcoder & C2PA Signing: 雛形・一部実装あり。GPUトランスコードやc2pa署名の本格実装は未確認。
- 1.4 Slicer Service: 雛形・一部実装あり。IPFS/Arweave/R2連携の詳細は未確認。
- 1.5 LiveKit SFU & Token Service: JWTトークンAPI雛形・CI/CD/Docker化まで完了。SFUデプロイは未確認。
- 1.6 Metadata Aggregator: 雛形・一部実装あり。外部APIポーリングやML処理の本実装は未確認。
- 1.7 WebTransport Server: 雛形・一部実装あり。HTTP/3やSSE/WSの詳細実装は未確認。
- 1.8 User Session & Token API: ★GET /api/cameras, POST /api/sessions, GET /api/token?cameraId= のAPI/DB実装とマイグレーション完了。Prisma＋PostgreSQL連携で動作確認済み。
- 1.9 モニタリング & CI/CD (Backend): CI/CD（lint, type-check, Docker build）は構築済み。Prometheus/Grafana/LokiやESLint等の導入状況は未確認。

---

## 1. Backend Implementation
1.1 インフラ構築
  - Kubernetes クラスター & GPU ノード
  - Terraform + Helm Charts
1.2 Collector Service
  - RTSP/HLS ポーリング実装
  - 映像＋メタデータ送信（HTTP/Kafka）
    - [x] HTTP API（/api/streams）による映像＋メタデータ登録・取得（2025-04-27）
    - [ ] RTSP/HLSポーリング実装
    - [ ] Kafka連携
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
    - [x] 実装・動作確認済（2025-04-27）
  - POST `/api/sessions`
    - [x] 実装・動作確認済（2025-04-27）
  - GET `/api/token?cameraId=`
    - [x] 実装・動作確認済（2025-04-27）
  - PostgreSQL モデル／マイグレーション
    - [x] Prisma＋PostgreSQL連携でDB設計・マイグレーション完了（2025-04-27）
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
