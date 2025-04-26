# Web Sensorium Earth ― 要件定義書

> **注意**
>
> -   ステークホルダー・非機能要件・承認フロー・リスク・日付は本書から除外
> -   「フロー」セクションを第三章に配置
> -   「対応範囲」セクションは設けない

---

## 第一章　背景・目的

地球規模で多発する気候危機・情報分断・生成 AI によるリアリティ喪失を受けて、「**本物の地球を感じ直すオンライン共感装置**」を構築する。
本システムは世界中のパブリック Web カメラ映像を**真正性担保付き**で集約し、視覚・聴覚・環境データを統合した多感覚体験を提供することを目的とする。

---

## 第二章　プロジェクト概要

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 名称       | **Web Sensorium Earth**                                                                                                |
| 提供形態   | ブラウザベース（PC／モバイル）、API 公開                                                                               |
| 中核思想   | - リアルネスの証明（C2PA 署名）<br>- エモーショナル・シンクロニー<br>- フィルターバブル破壊（ランダム視点）            |
| 主要レイヤ | 1. 真偽担保レイヤ（Authenticity）<br>2. 低遅延ストリームレイヤ（Live）<br>3. 多感覚インタラクションレイヤ（Sensorium） |

---

## 第三章　フロー

```mermaid
sequenceDiagram
  participant Cam as 公開Webカメラ
  participant Col as Collector
  participant Tr as Transcoder + C2PA署名
  participant SFU as LiveKit SFU
  participant CDN as CDN / Edge
  participant FE as フロントエンド
  Cam-->>Col: RTSP / HLS
  Col-->>Tr: 映像 + メタデータ
  Tr-->>SFU: WebRTC (AV1)
  Tr-->>CDN: HLS (Fallback)
  SFU-->>FE: 映像・音声ストリーム
  CDN-->>FE: HLS セグメント
  Col-->>FE: WebTransport (天気・SNS 感情等)
  FE-->>ユーザ: 多感覚インタラクション表示

  ## 第四章　機能要件

### 4.1　真偽担保レイヤ
- **C2PA 署名付与**
  - FFmpeg エンコード時に `c2pa-node` で動画フレームを署名
- **Provenance ログ**
  - 署名済みセグメントを IPFS＋Arweave に自動保存
- **改ざん検証表示**
  - `c2pa-js` で照合し、改変があれば警告バッジ

### 4.2　低遅延ストリームレイヤ
- **映像変換**
  - AV1／Opus へ GPU トランスコード
- **ルーティング**
  - LiveKit SFU による WebRTC Simulcast
- **バックアップ配信**
  - HLS v4 セグメントを自動生成・CDN 配信

### 4.3　多感覚インタラクションレイヤ
- **3D 地球儀描画**
  - Three.js WebGPU Renderer で 60 fps
- **ランダム視点ジャンプ**
  - 昼夜・人口密度加重ランダムアルゴリズム
- **グループセッション**
  - DataChannel で視聴者間タイムコード同期
- **環境音ポジショニング**
  - WebAudio API による立体音響
- **プライバシー保護**
  - WASM OpenCV でリアルタイム顔ブラー

---

## 第五章　データ要件

| データ種別          | 形式／プロトコル           | 保存先・保持方針           |
|---------------------|----------------------------|----------------------------|
| 映像・音声ストリーム | WebRTC (AV1/Opus)          | メモリのみ（録画しない）    |
| 署名済み HLS        | .m3u8 / .ts + C2PA         | IPFS + Arweave（永続）      |
| カメラメタデータ     | JSON (位置・URL 等)        | PostgreSQL                 |
| 気象・SNS 感情      | JSON over WebTransport     | Redis Pub/Sub（リアルタイム） |

---

## 第六章　システム構成

| レイヤ           | 主要コンポーネント                          |
|------------------|---------------------------------------------|
| インフラ         | Kubernetes + GPU ノード, Terraform IaC      |
| ストリーム基盤   | LiveKit SFU, Cloudflare CDN                 |
| 署名・保存       | FFmpeg + c2pa-node, IPFS, Arweave           |
| メタデータ基盤   | OpenWeather API, SNS API, Redis Stream      |
| フロントエンド   | React, Three.js WebGPU, `c2pa-js`           |

---

## 第七章　参考資料・用語定義

- **C2PA (Coalition for Content Provenance and Authenticity)**
  デジタルメディアの来歴を証明するオープン規格。

- **LiveKit**
  OSS の WebRTC SFU。水平スケールに優れる。

- **WebGPU**
  次世代ブラウザ向けグラフィクス API。

- **Arweave**
  永続ストレージを提供するブロックチェーンネットワーク。

---
```
