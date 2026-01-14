# パシャッと経費

レシート撮影＆AI自動入力アプリ

## 概要

スマートフォンのカメラでレシートを撮影すると、Gemini Flash AIが自動的に日付・金額・店名・カテゴリを読み取り、Firebaseに保存します。経費精算の手間を劇的に削減するWebアプリケーションです。

## 主な機能

- 📸 **カメラ撮影 / 画像アップロード**: スマホカメラまたはファイルからレシート画像を読み込み
- 🤖 **AI自動解析**: Gemini Flash モデルが日付、金額、店名、カテゴリをJSON形式で抽出
- ✏️ **データ編集**: AI解析結果を手動で修正可能
- 💾 **Firebase保存**: Firestore に自動保存
- 📊 **経費履歴**: 登録済みデータの一覧表示
- 📥 **CSVエクスポート**: Google スプレッドシートや会計ソフトで利用可能

## 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **AI連携**: Google Generative AI SDK (Gemini Flash)
- **データベース**: Firebase Firestore
- **デプロイ**: GitHub Pages (静的エクスポート)

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Gemini API設定
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

参考: `.env.local.example` ファイルを参照してください。

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

### 4. ビルド（静的エクスポート）

```bash
npm run build
```

`out` ディレクトリに静的ファイルが生成されます。

## GitHub Pages へのデプロイ

### 自動デプロイ（推奨）

1. GitHubリポジトリの **Settings > Secrets and variables > Actions** で環境変数を設定
2. `main` ブランチにプッシュすると自動的にGitHub Pagesにデプロイされます

### 手動デプロイ

```bash
npm run build
# out フォルダの内容を GitHub Pages にアップロード
```

### リポジトリ名がサブパスの場合

`next.config.ts` の以下のコメントを外して、リポジトリ名を設定してください：

```typescript
basePath: '/repository-name',
assetPrefix: '/repository-name/',
```

## 使い方

1. **トップページ**: カメラで撮影 または ファイルから画像を選択
2. **AI解析**: 「AI解析を開始」ボタンをクリック
3. **結果確認**: 自動入力された内容を確認・編集
4. **保存**: 「Firestoreに保存」ボタンで登録
5. **履歴確認**: 「経費履歴を見る」から過去のデータを確認
6. **エクスポート**: CSVダウンロードボタンでデータを出力

## ライセンス

MIT

## 作成者

Antigravity AI
