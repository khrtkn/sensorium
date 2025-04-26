# Frontend Architecture Document

## 1. Overview
「Web Sensorium Earth」のフロントエンド設計書。
`concept.md`のゴール（真正性担保×低遅延×多感覚体験）と、`requirements.md`の機能要件をもとに、React＋Three.js WebGPUを中核とする実装方針を示す。

## 2. Goals
- **Authenticity Layer** の可視化
- **Low‐Latency Stream Layer** の再生 & フォールバック
- **Sensorium Layer** の多感覚インタラクション

## 3. Tech Stack
- フレームワーク：React (TypeScript)
- 3D描画：Three.js + WebGPURenderer
- フォールバックレンダラー：Three.js WebGL2 (WebGPU非対応環境)
- メディア：WebRTC (AV1/Opus)、HLS フォールバック
- Provenance：c2pa-js (検証結果を1–5分キャッシュ)
- データ転送：WebTransport over HTTP/3 (フォールバック: HTTP/2 SSE / WebSocket)
- サウンド：WebAudio API
- 状態管理：Redux Toolkit または Zustand
- UI：Chakra UI または Material UI

## 4. フォルダ構成案
```
/src
  /components
    AuthBadge.tsx        // 改ざん検証バッジ
    GlobeView.tsx        // 3D 地球儀
    StreamPlayer.tsx     // WebRTC & HLS プレーヤ
    DataOverlay.tsx      // 天気・SNS メタデータ表示
    GroupSessionSync.tsx // グループセッション同期
  /hooks
    useC2PA.ts           // c2pa-js ラッパー
    useWebRTC.ts
    useWebTransport.ts
  /pages
    HomePage.tsx         // メインビュー
  /styles
  /utils
    randomView.ts        // ランダム視点アルゴリズム
    blurFace.ts          // WASM OpenCV
  index.tsx
  App.tsx

/public
  index.html

```

## 5. コンポーネント概要

### 5.1 AuthBadge
- `c2pa-js`でストリームフレームハッシュ検証
- 異常時に⚠︎警告アイコンを表示

### 5.2 StreamPlayer
- WebRTC vs HLS 自動切替（低遅延 ≤2s / フォールバック ≃8s）
- AV1 & Opus 再生対応

### 5.3 GlobeView
- Three.js WebGPURenderer で 5k+ ピンを 60fps 表示
- `randomView.ts`による 30s 間隔ジャンプ

### 5.4 DataOverlay
- WebTransport over HTTP/3 で 1Hz 配信される天気・SNS感情をオーバーレイ
- Redux で状態管理

### 5.5 GroupSessionSync
- LiveKit DataChannel を用いて同一ルーム内視聴者のタイムコード同期を実装

## 6. インタラクションフロー
1. ページロード: `App.tsx` が各レイヤ初期化
2. Provenance 検証: `useC2PA` フックが検証結果を `AuthBadge` に通知
3. ストリーム再生: `useWebRTC` → `StreamPlayer`
3.5. グループセッション同期: LiveKit DataChannel で再生位置を同期
4. センサデータ表示: `useWebTransport` → `DataOverlay`
5. 地球儀レンダリング: `GlobeView` + `randomView`
6. 顔ブラー: `blurFace` util が WebAssembly で実行

## 7. デプロイ & CI/CD
- Vercel または Netlify
- GitHub Actions: lint, type-check, build, preview
- モニタリング: Prometheus、Grafana、Loki ダッシュボード
- コード品質: ESLint、Prettier、Commitlint を CI に追加

## 8. 今後の拡張
- ヒートマップ可視化
- モバイル最適化
