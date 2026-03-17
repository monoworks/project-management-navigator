# プロジェクトマネジメントナビゲーター

## アプリ概要

システム開発を外部ベンダーに委託する**発注側企業**向けのガイドアプリ。
エンジニアが少ない企業でも、各工程でベンダーの成果物を適切に確認できるよう、
チェックリスト・確認ポイント・注意事項を提供する。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Supabase (DB + Storage + Auth)
- **パスエイリアス**: `@/*` → `./src/*`

## コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

## ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # トップページ（手法選択）
│   ├── waterfall/
│   │   ├── page.tsx              # WF一覧（最初のフェーズへリダイレクト）
│   │   ├── [phase]/page.tsx      # WFフェーズ詳細
│   │   └── rules/page.tsx        # WF管理ルール一覧
│   ├── agile/
│   │   ├── page.tsx              # アジャイル一覧（最初のフェーズへリダイレクト）
│   │   ├── [phase]/page.tsx      # アジャイルフェーズ詳細
│   │   └── rules/page.tsx        # アジャイル管理ルール一覧
│   └── api/
│       ├── auth/route.ts         # 認証API
│       ├── files/route.ts        # ファイルアップロードAPI
│       ├── files/[id]/route.ts   # ファイル削除API
│       ├── phases/[methodology]/[phase]/route.ts  # フェーズCRUD API
│       └── rules/[methodology]/route.ts           # 管理ルールCRUD API
├── components/
│   ├── AuthGuard.tsx             # 認証ガード（未認証時はログイン画面表示）
│   ├── AuthProvider.tsx          # 認証コンテキスト（editor/viewer ロール管理）
│   ├── Header.tsx                # 共通ヘッダー
│   ├── LoginForm.tsx             # ログインフォーム
│   ├── MethodologySidebar.tsx    # サイドバー（フェーズ一覧ナビ）
│   └── PhaseDetail.tsx           # フェーズ詳細表示・編集コンポーネント
├── data/
│   ├── waterfall.ts              # WFフェーズデータ（8工程）
│   ├── agile.ts                  # アジャイルフェーズデータ（5工程）
│   └── management-rules.ts       # 管理ルールデータ（WF 7カテゴリ、アジャイル 7カテゴリ）
├── lib/
│   ├── supabase.ts               # Supabaseクライアント初期化
│   ├── phases.ts                 # フェーズのDB読み書き（オーバーライド機能）
│   ├── rules.ts                  # 管理ルールのDB読み書き（オーバーライド/カスタム追加/削除）
│   └── files.ts                  # ファイルアップロード・削除（Supabase Storage）
└── types/
    └── index.ts                  # 型定義（Phase, Methodology, ManagementRule等）
```

## データアーキテクチャ

### 静的データ + DB オーバーライドのハイブリッド構成

- **ベースデータ**: `src/data/` 配下のTypeScriptファイルにハードコード
- **カスタマイズ**: Supabase DBのオーバーライドテーブルで上書き可能
- **Supabase未設定時**: 静的データのみで動作（フォールバック）

### Supabaseテーブル構成

| テーブル | 用途 |
|---------|------|
| `phase_overrides` | フェーズの説明・進め方・注意事項のカスタマイズ |
| `management_rule_overrides` | 管理ルールの上書き |
| `custom_management_rules` | ユーザー追加の管理ルール |
| `deleted_management_rules` | 静的ルールの論理削除 |
| `deliverable_files` | アップロードファイルのメタデータ |

### Supabase Storage

- バケット: `deliverables`
- パス構造: `{methodology}/{phase}/{timestamp}_{filename}`

## 認証

- **パスワード認証**（環境変数ベース、トークンはlocalStorage保存）
- **2つのロール**:
  - `editor`: コンテンツの編集・ファイルアップロードが可能
  - `viewer`: 閲覧のみ
- 環境変数: `AUTH_PASSWORD`（editor用）、`AUTH_VIEWER_PASSWORD`（viewer用）

## コンテンツ構成

### ウォーターフォール型（8工程）

1. **企画構想** - 経営課題の整理、プロジェクト企画書作成
2. **ベンダー選定・契約** - RFP作成、ベンダー評価、契約締結
3. **要件定義の確認** - ベンダー成果物のレビュー、要件漏れチェック
4. **設計の確認** - 画面設計・帳票の確認、業務フロー整合性チェック
5. **開発・テスト工程の管理** - 進捗監視、品質指標確認
6. **受入テスト・検収** - 業務シナリオテスト、検収判定
7. **リリース・移行** - ユーザー教育、データ移行確認、Go/No-Go判断
8. **運用・保守管理** - SLA管理、改善要望管理、ベンダー評価

### アジャイル型（5工程）

1. **プロジェクト立ち上げ・契約** - ビジョン策定、MVP定義、準委任契約
2. **バックログ管理** - 優先順位付け、受入条件の定義
3. **スプリント参加・進捗確認** - レビュー参加、ベロシティ確認
4. **成果物確認・受入** - スプリント単位の受入テスト
5. **リリース・運用開始** - 段階的リリース、保守体制移行

### 管理ルール

- **WF用**: 進捗管理、品質管理、変更管理、リスク管理、コミュニケーション管理、コスト管理、契約・ベンダー管理
- **アジャイル用**: PO責務、スプリント確認、バックログ管理、品質確認、コミュニケーション、コスト管理、契約・ベンダー管理

### 各工程の構成要素

各フェーズは以下の情報で構成される:
- **進め方** (`approach`): 発注側として実施すべきステップ
- **成果物** (`deliverables`): 確認すべき成果物とサンプル
- **注意事項** (`cautions`): 失敗を防ぐためのチェックポイント

## 環境変数

| 変数名 | 用途 | デフォルト |
|--------|------|-----------|
| `AUTH_PASSWORD` | editor用パスワード | `admin` |
| `AUTH_VIEWER_PASSWORD` | viewer用パスワード | `viewer` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | なし（未設定時はDB機能無効） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | なし |

## 開発時の注意事項

- コンテンツは全て**発注側企業**（クライアント）の視点で記述する
- 技術的な専門用語はなるべく避け、非エンジニアでも理解できる表現を使う
- フェーズIDの変更はURLのルーティングに影響するため注意（`/waterfall/{phaseId}`）
- Supabase未設定でもアプリは動作する（静的データのみモード）
- UIの色分け: ウォーターフォール=blue、アジャイル=green
