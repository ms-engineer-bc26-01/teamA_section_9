'use client' // ブラウザで動かすための宣言

import { useEffect, useState } from 'react'

export default function Home() {
  // バックエンドからのメッセージを保存する箱
  const [message, setMessage] = useState('読み込み中...')

useEffect(() => {
    // バックエンドへアクセス
    fetch('http://localhost:8000/api/test')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message); 
      })
      .catch((err) => {
        console.error("エラーが発生しました:", err);
        setMessage("データの取得に失敗しました");
      });
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>SkinMate プロトタイプ</h1>
      <p>バックエンドからのメッセージ： <strong>{message}</strong></p>
    </main>
  )
}