# プロジェクト管理ナビゲーター

ウォーターフォール型・アジャイル（スクラム）型の開発プロジェクトにおける工程ガイド・管理ルールを提供するWebアプリケーション。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | React 19 |
| スタイリング | Tailwind CSS 4 |
| バックエンド | Supabase (オプション) |
| デプロイ | Vercel |

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス可能。

## 環境変数 (.env.local)

```
AUTH_PASSWORD=admin              # 編集者ログイン用パスワード
AUTH_VIEWER_PASSWORD=viewer      # 閲覧者ログイン用パスワード
NEXT_PUBLIC_SUPABASE_URL=        # Supabase プロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase Anon Key
```

Supabase未設定の場合は静的データのみで動作（編集内容の永続化は不可）。

## 認証

パスワードベースの簡易認証。2つのロールが存在する:

- **editor**: 全機能利用可能（工程・ルールの編集、ファイルアップロード、カテゴリ追加・削除）
- **viewer**: 閲覧のみ

## ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # トップページ（手法選択）
│   ├── waterfall/
│   │   ├── page.tsx              # ウォーターフォール工程一覧
│   │   ├── [phase]/page.tsx      # 工程詳細
│   │   └── rules/page.tsx        # 管理ルール一覧
│   ├── agile/
│   │   ├── page.tsx              # アジャイル工程一覧
│   │   ├── [phase]/page.tsx      # 工程詳細
│   │   └── rules/page.tsx        # 管理ルール一覧
│   └── api/
│       ├── auth/route.ts         # 認証API
│       ├── files/route.ts        # ファイルアップロード
│       ├── files/[id]/route.ts   # ファイル削除
│       ├── rules/[methodology]/route.ts    # 管理ルール CRUD
│       └── phases/[methodology]/[phase]/route.ts  # 工程オーバーライド
├── components/
│   ├── Header.tsx                # ヘッダーナビゲーション
│   ├── AuthGuard.tsx             # 認証ガード
│   ├── AuthProvider.tsx          # 認証コンテキスト
│   ├── LoginForm.tsx             # ログインフォーム
│   ├── MethodologySidebar.tsx    # サイドバー
│   └── PhaseDetail.tsx           # 工程詳細コンポーネント
├── data/
│   ├── management-rules.ts       # 管理ルール静的データ
│   ├── waterfall.ts              # ウォーターフォール工程データ（11工程）
│   └── agile.ts                  # アジャイル工程データ（8工程）
├── lib/
│   ├── supabase.ts               # Supabaseクライアント
│   ├── rules.ts                  # 管理ルール操作（CRUD）
│   ├── phases.ts                 # 工程オーバーライド操作
│   └── files.ts                  # ファイルストレージ
└── types/
    └── index.ts                  # 型定義
```

## データアーキテクチャ

### 静的データ（デフォルト）

工程情報と管理ルールは `src/data/` にハードコードされている。Supabase未接続でもこのデータで画面表示される。

### Supabase（オプション・永続化用）

以下のテーブルを使用:

| テーブル | 用途 |
|---------|------|
| `management_rule_overrides` | 既存ルールの説明・項目の上書き |
| `custom_management_rules` | ユーザーが追加したカスタムカテゴリ |
| `deleted_management_rules` | 削除されたカテゴリの記録 |
| `phase_overrides` | 工程内容のカスタマイズ |
| `uploaded_files` | アップロードファイルのメタデータ |

### Supabase テーブル定義 (SQL)

```sql
-- 管理ルールのオーバーライド
CREATE TABLE management_rule_overrides (
  methodology_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  description TEXT,
  items JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (methodology_id, rule_id)
);

-- カスタム管理ルール（ユーザー追加分）
CREATE TABLE custom_management_rules (
  methodology_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (methodology_id, rule_id)
);

-- 削除された管理ルール
CREATE TABLE deleted_management_rules (
  methodology_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (methodology_id, rule_id)
);

-- 工程のオーバーライド
CREATE TABLE phase_overrides (
  methodology_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  approach JSONB,
  deliverables JSONB,
  cautions JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (methodology_id, phase_id)
);

-- アップロードファイル
CREATE TABLE uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  methodology_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 管理ルールカテゴリ一覧

### ウォーターフォール（7カテゴリ）

1. 進捗管理 - WBS、マイルストーン、EVM等
2. 品質管理 - Exit Criteria、レビュー、メトリクス
3. 変更管理 - 変更要求、影響評価、承認フロー
4. リスク管理 - リスク識別、評価、対策
5. コミュニケーション管理 - 会議体、報告ルート
6. 課題管理 - 課題台帳、ステータス管理、エスカレーション
7. 構成管理 - バージョン管理、ブランチ戦略

### アジャイル（7カテゴリ）

1. スクラムイベント運営 - スプリント構造、タイムボックス
2. プロダクトバックログ管理 - ユーザーストーリー、見積もり
3. スプリント運営 - スプリントゴール、ベロシティ
4. 品質管理 - TDD、コードレビュー、CI/CD
5. コミュニケーション - Slack、PO対応時間
6. 課題管理 - 課題起票、優先度分類、ナレッジ蓄積
7. ツール管理 - Jira、GitHub、Confluence等

カテゴリはeditorロールで追加・編集・削除が可能。

## 主な機能

- 手法選択（ウォーターフォール / アジャイル）
- 工程別ガイド（進め方、成果物、注意事項）
- 管理ルール一覧・編集
- 管理カテゴリの追加・削除（editor権限）
- 成果物サンプルファイルのアップロード・ダウンロード
- ロールベースアクセス制御

## 開発ブランチ

- メインブランチ: `claude/project-management-app-EepRw`
- Vercelデプロイ: 上記ブランチへのpushで自動デプロイ
