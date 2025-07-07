# Mastraのストリーミングチャンクタイプの詳細解説

Mastraのストリーミング機能では、AI SDKを使用してリアルタイムでAIレスポンスを配信します。以下、各チャンクタイプについて詳しく説明します。

## 基本的なストリーミングアーキテクチャ

MastraはAI SDKの`streamText`と`streamObject`を使用し、2つのストリーミング形式を提供します：

1. **`toDataStreamResponse()`** - すべてのチャンクタイプを含む完全なデータストリーム（デフォルト）
2. **`toTextStreamResponse()`** - テキストのみのストリーム（構造化された出力向け）

## チャンクタイプの一覧と詳細

### 1. テキスト関連チャンク

#### `text` (プレフィックス: `0:`)
```
0:こんにちは
0:、
0:世界
0:！
```
- **用途**: LLMからの基本的なテキストレスポンス
- **特徴**: 増分的に送信され、リアルタイムでテキストが表示される
- **処理**: `onTextPart(value)`ハンドラで処理

### 2. ツール関連チャンク

#### `tool_call` (プレフィックス: `9:`)
```typescript
9:{"toolCallId":"call_123","toolName":"search","args":{"query":"検索クエリ"}}
```
- **用途**: ツールの呼び出し情報
- **構造**: ツールID、ツール名、引数を含む
- **処理**: `onToolCallPart(value)`で処理

#### `tool_call_streaming_start` (プレフィックス: `b:`)
```typescript
b:{"toolCallId":"call_123","toolName":"search"}
```
- **用途**: ストリーミングツールコールの開始通知
- **特徴**: ツールの実行が始まったことを示す
- **処理**: `onToolCallStreamingStartPart(value)`で処理

#### `tool_call_delta` (プレフィックス: `c:`)
```typescript
c:{"toolCallId":"call_123","argsTextDelta":"{\"query\":\""}
```
- **用途**: ツール引数の増分更新
- **特徴**: 複雑なツール引数をストリーミングで構築
- **処理**: `onToolCallDeltaPart(value)`で処理

#### `tool_result` (プレフィックス: `a:`)
```typescript
a:{"toolCallId":"call_123","result":{"data":"検索結果のデータ"}}
```
- **用途**: ツール実行結果の配信
- **特徴**: 実行完了後の結果を含む
- **処理**: `onToolResultPart(value)`で処理

### 3. ステップ制御チャンク

#### `start_step` (プレフィックス: `f:`)
```typescript
f:{"messageId":"msg_123"}
```
- **用途**: 生成ステップの開始
- **特徴**: 新しい推論ステップの開始を示す
- **処理**: `onStartStepPart(value)`で処理

#### `finish_step` (プレフィックス: `e:`)
```typescript
e:{"isContinued":false,"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":20}}
```
- **用途**: 生成ステップの完了
- **特徴**: 継続フラグと使用統計を含む
- **処理**: `onFinishStepPart(value)`で処理

### 4. 推論関連チャンク

#### `reasoning` (プレフィックス: `g:`)
```typescript
g:"この問題を解決するために、まず..."
```
- **用途**: AI推論過程の可視化
- **特徴**: 思考プロセスの透明性向上
- **処理**: `onReasoningPart(value)`で処理

#### `reasoning_signature` (プレフィックス: `j:`)
```typescript
j:{"signature":"reasoning_v1"}
```
- **用途**: 推論形式の識別
- **特徴**: 推論データの構造バージョン
- **処理**: `onReasoningSignaturePart(value)`で処理

#### `redacted_reasoning` (プレフィックス: `i:`)
```typescript
i:{"data":"[秘匿された推論内容]"}
```
- **用途**: 機密情報を含む推論の秘匿
- **特徴**: セキュリティを保ちながら推論を提供
- **処理**: `onRedactedReasoningPart(value)`で処理

### 5. メタデータチャンク

#### `data` (プレフィックス: `2:`)
```typescript
2:[{"custom":"カスタムデータ","timestamp":"2024-01-01T00:00:00Z"}]
```
- **用途**: カスタムデータの送信
- **特徴**: アプリケーション固有の情報
- **処理**: `onDataPart(value)`で処理

#### `finish_message` (プレフィックス: `d:`)
```typescript
d:{"finishReason":"stop","usage":{"promptTokens":50,"completionTokens":100}}
```
- **用途**: メッセージ完了とトークン使用量
- **特徴**: 課金情報と完了理由を含む
- **処理**: `onFinishMessagePart(value)`で処理

#### `message_annotations` (プレフィックス: `8:`)
```typescript
8:[{"type":"citation","source":"document.pdf","page":1}]
```
- **用途**: メッセージへの注釈情報
- **特徴**: 引用情報やメタデータ
- **処理**: `onMessageAnnotationsPart(value)`で処理

### 6. ファイル・メディアチャンク

#### `file` (プレフィックス: `k:`)
```typescript
k:{"data":"base64エンコードされたデータ","mimeType":"image/png"}
```
- **用途**: ファイルデータの送信
- **特徴**: Base64エンコード、MIMEタイプ指定
- **処理**: `onFilePart(value)`で処理

#### `source` (プレフィックス: `h:`)
```typescript
h:{"type":"document","uri":"https://example.com/doc.pdf"}
```
- **用途**: ソース情報の参照
- **特徴**: 外部リソースへの参照
- **処理**: `onSourcePart(value)`で処理

### 7. エラーチャンク

#### `error` (プレフィックス: `3:`)
```typescript
3:"処理中にエラーが発生しました: 接続タイムアウト"
```
- **用途**: エラー情報の配信
- **特徴**: 即座にエラーを通知
- **処理**: `onErrorPart(value)`で処理

## 実装における処理パターン

### サーバーサイド（agents.ts:306-327）
```typescript
const streamResponse = rest.output
  ? streamResult.toTextStreamResponse({
      headers: { 'Transfer-Encoding': 'chunked' },
    })
  : streamResult.toDataStreamResponse({
      sendUsage: true,          // 使用量情報を送信
      sendReasoning: true,      // 推論情報を送信
      getErrorMessage: (error) => `エラー: ${error.message}`,
      headers: { 'Transfer-Encoding': 'chunked' },
    });
```

### クライアントサイド処理
```typescript
await processDataStream({
  stream,
  onTextPart(value) {
    // テキストの増分更新
    currentMessage.content += value;
    updateUI(currentMessage);
  },
  onToolCallPart(value) {
    // ツール呼び出しの処理
    const invocation = { state: 'call', ...value };
    toolInvocations.push(invocation);
  },
  onToolResultPart(value) {
    // ツール結果の処理
    const invocation = toolInvocations.find(i => i.toolCallId === value.toolCallId);
    invocation.state = 'result';
    invocation.result = value.result;
  },
  onFinishMessagePart(value) {
    // 完了処理
    finishReason = value.finishReason;
    usage = value.usage;
    onComplete();
  },
});
```

## フロントエンド実装の推奨事項

1. **状態管理**: 各チャンクタイプに対応する状態を適切に管理
2. **エラーハンドリング**: `error`チャンクを確実にキャッチ
3. **UI更新**: `text`チャンクでのリアルタイム更新
4. **ツール可視化**: ツール関連チャンクでの進捗表示
5. **メタデータ活用**: 使用量や推論情報の表示

## チャンクタイプの完全な型定義

```typescript
type DataStreamPartType =
  | { type: 'text'; value: string }
  | { type: 'data'; value: JSONValue[] }
  | { type: 'error'; value: string }
  | { type: 'message_annotations'; value: JSONValue[] }
  | { type: 'tool_call'; value: ToolCall<string, any> }
  | { type: 'tool_result'; value: Omit<ToolResult<string, any, any>, "args" | "toolName"> }
  | { type: 'tool_call_streaming_start'; value: { toolCallId: string; toolName: string } }
  | { type: 'tool_call_delta'; value: { toolCallId: string; argsTextDelta: string } }
  | { type: 'finish_message'; value: { finishReason: string; usage?: { promptTokens: number; completionTokens: number } } }
  | { type: 'finish_step'; value: { isContinued: boolean; finishReason: string; usage?: { promptTokens: number; completionTokens: number } } }
  | { type: 'start_step'; value: { messageId: string } }
  | { type: 'reasoning'; value: string }
  | { type: 'source'; value: LanguageModelV1Source }
  | { type: 'redacted_reasoning'; value: { data: string } }
  | { type: 'reasoning_signature'; value: { signature: string } }
  | { type: 'file'; value: { data: string; mimeType: string } };
```

## チャンクプレフィックス一覧

```typescript
const DataStreamStringPrefixes = {
  text: "0",                    // テキスト
  data: "2",                    // カスタムデータ
  error: "3",                   // エラー
  message_annotations: "8",     // メッセージ注釈
  tool_call: "9",              // ツール呼び出し
  tool_result: "a",            // ツール結果
  tool_call_streaming_start: "b", // ツールストリーミング開始
  tool_call_delta: "c",        // ツール引数増分
  finish_message: "d",         // メッセージ完了
  finish_step: "e",            // ステップ完了
  start_step: "f",             // ステップ開始
  reasoning: "g",              // 推論
  source: "h",                 // ソース
  redacted_reasoning: "i",     // 秘匿推論
  reasoning_signature: "j",    // 推論署名
  file: "k",                   // ファイル
}
```

これらのチャンクタイプを適切に処理することで、リッチなストリーミング体験を提供できます。
