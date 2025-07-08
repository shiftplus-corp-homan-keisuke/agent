"use client";

import React, { useState, useRef, useEffect } from "react";

// メッセージの型定義
type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function ChannelPage() {
  // メッセージの状態
  const [messages, setMessages] = useState<Message[]>([]);
  // 入力テキストの状態
  const [inputText, setInputText] = useState("");
  // 送信中の状態
  const [isLoading, setIsLoading] = useState(false);
  // メッセージコンテナへの参照
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたときに自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 最下部へスクロールする関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // メッセージを送信する関数
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    // ユーザーメッセージをステートに追加
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // SSEを使用してストリーミングレスポンスを取得
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputText }),
      });

      // レスポンスをテキストとして読み込む
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("レスポンスの読み込みに失敗しました");
      }

      // ボットの応答メッセージを作成
      const botMessageId = (Date.now() + 1).toString();
      let botMessageContent = "";

      // 初期の空のボットメッセージを追加
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          content: "",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      // ストリーミングデータを読み込む
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.substring(6));

            if (data.done) {
              // ストリーミング完了
              break;
            } else if (data.error) {
              // エラー発生
              throw new Error(data.error);
            } else if (data.chunk) {
              // チャンクデータを処理
              if (data.chunk.type === "text") {
                botMessageContent += data.chunk.text || "";

                // ボットメッセージを更新
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, content: botMessageContent }
                      : msg
                  )
                );
              }
            }
          } catch (e) {
            console.error("SSEデータの解析エラー:", e);
          }
        }
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);

      // エラーメッセージを表示
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "エラーが発生しました。もう一度お試しください。",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>メッセージを送信してチャットを開始しましょう</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? "送信中..." : "送信"}
          </button>
        </form>
      </div>
    </div>
  );
}
