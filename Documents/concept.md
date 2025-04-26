実装アーキテクチャ v 2025

『リアルな地球を触れ直す共感装置』 を実現するため、真偽担保・低遅延・多感覚の三層を核に再設計します。

⸻

1. 真偽担保レイヤ（Authenticity Layer）

機能 技術／ライブラリ 目的
C2PA 署名パイプ c2pa-node で FFmpeg 出力にマニフェストを付与 ￼ 「本物の一筆」を動画フレーム単位で刻印
Provenance Log 署名後の HLS セグメントを IPFS + Arweave にピン留め 改ざん検出 & 歴史アーカイブ
Content Credentials API CAI メタデータをフロントで検証 (c2pa-js) 視聴時に「改変履歴」バッジを表示 ￼
Hardware Source Leica M11-P／Nikon Z6 III 等の C2PA 対応カメラを優先 ￼ 入口から真正性を確保

⸻

2. 低遅延ストリーム・レイヤ（Live Stream Layer）

パイプ 技術スタック ポイント
Ingest FFmpeg GPU transcode → AV1 (CQ 37) 高効率・硬解デコード対応 ￼
ルーティング LiveKit SFU（Go + Redis） 水平スケール & WebRTC simulcast ￼
配信 WebRTC (≤ 2 s) ／ HLS fallback (≃ 8 s) 端末性能に応じ自動切替
メタデータ WebTransport over HTTP/3 カメラ位置・天気・SNS 感情を 1 Hz で push ￼
署名維持 セグメント毎に C2PA ハッシュを添付 フロント側でハッシュ再計算し照合

⸻

3. 多感覚インタラクション・レイヤ（Sensorium Layer）

要素 実装案 体験価値
3D 地球儀 Three.js WebGPURenderer + BatchedMesh ￼ WebGPU で 5 k+ ピンを 60 fps
ランダム視点 アルトリズム：地理・昼夜・人口密度で重み付け → 30 s/shot で自動ジャンプ “フィルターバブル破壊”
グループセッション LiveKit DataChannel でタイムコード同期 世界同時“エモーショナル・シンクロニー”
環境音 & センサ NDI → Opus → WebAudio positional 視覚＋聴覚の没入
フェイスブラー WebAssembly (OpenCV) でローカル推論 + Masking GDPR 対応 ￼

⸻

4. マイクロサービス構成

graph LR
A[Collector] -->|RTSP/HLS| B[Transcoder ⬆ C2PA]
B --> C[Slicer ▶ IPFS+Arweave]
B --> D[LiveKit SFU]
D --> E[Web Front]
F[Metadata Aggregator] --> E
G[Provenance Verifier] --> E
H[User Session API] --> E

    •	Collector: Windy/EarthCam/API, 自治体カメラを定期クローリング  ￼
    •	Metadata Aggregator: OpenWeather, SNS (Twitter/X), sentiment ML
    •	Provenance Verifier: c2pa-js でハッシュ照合
    •	Infra: K8s + GPU ノード (AV1 encode) + Cloudflare R2; IaC は Terraform

⸻

5. Dev Roadmap（主要マイルストーン）

月 Deliverable Tech Focus
M0-M2 〈α〉10 都市 PoC (WebRTC Only) LiveKit, WebGPU 地球儀
M3-M5 〈β〉C2PA 署名 + IPFS 保存 c2pa-node, IPFS
M6-M8 〈v1.0〉500 + cams, WebTransport メタデータ, グループ視聴 WebTransport, Redis ルーム
M9-M12 〈v1.5〉AI 感情ヒートマップ, 教育モード & API 公開 WASM sentiment, SDK

⸻

6. コア技術選定理由
    1. WebGPU：ブラウザ標準化が完了し、WebGL2 の約 3 × 描画性能 ￼
    2. AV1 + WebCodecs：モダン端末で H/W デコード; 帯域 30 % 削減 ￼
    3. C2PA：業界合意形成が進み、Leica / Nikon など実運用例が登場 ￼
    4. WebTransport：HTTP/3 ベースで低遅延・多ストリーム; WebSocket 置換 ￼

⸻

7. リスク & ガバナンス

リスク 対策
プライバシー侵害 エッジブラー＆音声ローカライゼーション、ロケーション精度を市区町村までに限定
API レート制限 キャッシュ前提のキャプチャ・オンデマンド制御、Windy API 上限監視
生成 AI 偽装 C2PA 検証必須、未署名カメラには「⚠︎ Unverified」バッジ
高負荷 SFU 自動スケール & エッジ CDN (WebRTC→HLS 切替)

⸻

まとめ

この実装案は 「リアルの真正性 × 体験の共感性 × インフラの拡張性」 を三位一体で実装し、ポスト・トゥルース時代に**“触れ直せる地球”**をウェブに常設します。
