# NestJS on Mastra Agent

TypeScript-first AIエージェントフレームワーク[Mastra](https://mastra.ai/ja/docs)を使用したNestJSアプリケーションです。

## 特徴

- **TypeScript-first**: MastraはTypeScriptファーストで設計されており、LangChain/LangGraphのようなPythonファーストなツールよりも開発効率が良い
- **NestJS統合**: エンタープライズレベルのアーキテクチャとスケーラビリティを提供
- **RESTful API**: Swagger UIによる直感的なAPI仕様書とテスト機能
- **MongoDB統合**: エージェントの履歴とメッセージの永続化
- **SSE対応**: リアルタイムレスポンスストリーミング

## 前提条件

- Docker & Docker Compose

## クイックスタート

### 1. 環境変数の設定

```bash
cp .env.example .env
# 必要な環境変数を設定
```

### 2. 開発環境の起動

```bash
# 開発環境（ホットリロード付き）
docker-compose --profile dev up -d

# または本番環境
docker-compose up -d
```

### 3. API確認

- 開発環境: http://localhost:3001/api (Swagger UI)
- 本番環境: http://localhost:3000/api (Swagger UI)


### アーキテクチャ

```
src/
├── agent/           # エージェントAPI
├── agent-history/   # エージェント履歴管理
├── agent-message/   # メッセージ管理
├── mastra/          # Mastra統合サービス
├── schemas/         # MongoDBスキーマ
└── tools/           # エージェント用ツール
```

## API仕様

### エージェント実行
```
POST /agent/run
```

### 履歴取得
```
GET /agent-history
```

詳細な仕様は Swagger UI で確認してください。

## 環境構築

本プロジェクトは以下の環境で動作します：

- **開発環境**: ポート3001、ホットリロード有効
- **本番環境**: ポート3000、最適化済みビルド
- **MongoDB**: ポート27017、データ永続化
