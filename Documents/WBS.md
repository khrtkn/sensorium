# Work Breakdown Structure (WBS)

プロジェクト要件（`requirements.md`）、フロントエンド設計（`frontend.md`）、バックエンド設計（`backend.md`）を達成するためのタスク分解。

---

## 進捗メモ（2025-04-27 23:00 JST 更新）

### やったこと
- User Session & Token API（GET /api/cameras, POST /api/sessions, GET /api/token?cameraId=）のAPI/DB実装・マイグレーション・動作確認（Prisma＋PostgreSQL連携）
- Collectorサービスとして、HTTP API（/api/streams）でカメラ映像ストリーム＋メタデータの登録・取得機能を実装
- Prismaスキーマの拡張（Camera, Streamモデル追加）とマイグレーション
- APIのバリデーション・エラーハンドリング実装
- **TypeScript型定義の明示（Request/Response）・@types/express v4への統一**
- **asyncHandler導入で全APIハンドラをasync/await＋型安全に統一、Express標準エラーハンドラ追加**
- **package-lock.jsonの不整合修正、CI/CD（npm ci）エラー完全解消**
- **GitHub Actionsでのビルド・テスト自動化が正常動作**

### わかったこと
- Prisma generatorのoutputはコメントアウト不可、削除が必須
- サーバー再起動しないとAPIエンドポイントの追加・修正が反映されない
- POST /api/streamsでcameraIdの存在チェック・メタデータ(JSON)保存もできる
- カメラ・ストリームの登録・取得APIがCollectorサービスの基盤になる
- **Express本体と型定義（@types/express）は必ずバージョンを揃える必要がある**
- **async/awaitをExpressハンドラで使う場合はasyncHandlerなどでcatch(next)することが必須**
- **CI/CDではpackage.jsonとpackage-lock.jsonの同期が重要**

### 次やること
- Collectorサービス: RTSP/HLSポーリングやKafka連携の設計・実装着手
- Streamデータの削除・編集API追加
- APIドキュメント自動生成（Swagger/OpenAPI）
- 必要に応じてフロントエンド側（ストリーム再生UI、管理UI）の設計・着手
- WBSの進捗に沿って、他サービス（Transcoder、Metadata Aggregator等）との連携も検討
- **Transcoderサービスの型定義整備・Kafka/DB連携**
- **E2Eテスト自動化の設計・実装**
- **README/セットアップ手順・Secrets管理整備**

### プロジェクト運用ルール（2025-04-27追加・23:00再確認）
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
  - **2025-04-27 asyncHandler導入・型定義・CI/CD完全対応済み（Express型エラー・依存エラー解消）**
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
  - C2PA署名
1.4 Slicer Service
  - IPFS/Arweave/R2連携
1.5 LiveKit SFU & Token Service
  - JWTトークンAPI
  - SFUデプロイ
1.6 Metadata Aggregator
  - 外部APIポーリング
  - ML処理
1.7 WebTransport Server
  - HTTP/3, SSE, WS
1.8 User Session & Token API
  - GET `/api/cameras` (IP制限/APIキー)
    - [x] 実装・動作確認済（2025-04-27）
  - POST `/api/sessions`
    - [x] 実装・動作確認済（2025-04-27）
  - GET `/api/token?cameraId=`
    - [x] 実装・動作確認済（2025-04-27）
  - **asyncHandler導入・型定義・CI/CD完全対応済み（2025-04-27）**
1.9 モニタリング & CI/CD (Backend)
  - Lint, type-check, Docker build
  - Prometheus/Grafana/Loki
  - ESLint

---

## 2. Frontend Implementation
2.1 UI設計・API連携
2.2 Three.js/WebGPU実装
2.3 Viteビルド

---

## 3. CI/CD・自動化
3.1 GitHub Actions
3.2 E2Eテスト自動化
3.3 本番デプロイ戦略

---

## 4. ドキュメント・運用
4.1 README/セットアップ手順
4.2 .env.exampleやSecrets管理

---
