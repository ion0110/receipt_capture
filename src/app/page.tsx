'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, LogOut, Moon, Sun } from 'lucide-react';
import { analyzeReceipt, ReceiptData } from '@/lib/gemini';
import { db, signOut } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 未ログイン時はログインページにリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 画像選択/撮影ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ファイル処理の共通関数
  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReceiptData(null);
      setError('');
      setSaveSuccess(false);
    } else {
      setError('画像ファイルを選択してください');
    }
  };

  // ドラッグ＆ドロップハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // レシート解析実行
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const data = await analyzeReceipt(selectedFile);
      setReceiptData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシート解析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Firestoreに保存（ユーザーIDごとに分離）
  const handleSave = async () => {
    if (!receiptData || !user) return;

    setIsSaving(true);
    setError('');

    try {
      // receipts/{userId}/items/{receiptId} 構造で保存
      await addDoc(collection(db, 'receipts', user.uid, 'items'), {
        ...receiptData,
        createdAt: Timestamp.now(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        // 3秒後にリセット
        setSelectedFile(null);
        setPreviewUrl('');
        setReceiptData(null);
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // フォーム編集ハンドラー
  const handleChange = (field: keyof ReceiptData, value: string | number) => {
    if (receiptData) {
      setReceiptData({ ...receiptData, [field]: value });
    }
  };

  return (
    <div className={isDark ? 'min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50'}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-center whitespace-nowrap">
              📸 パシャッと経費
            </h1>
            <div className="flex-1 flex justify-end gap-2">
              <button
                onClick={toggleTheme}
                className={isDark ? 'bg-white/10 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center' : 'bg-gray-200 text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-300 transition-all flex items-center'}
                title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all font-semibold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
          <p className="text-emerald-300 text-lg text-center">
            レシートを撮影してAIが自動入力
          </p>
          {user && (
            <p className="text-gray-400 text-sm text-center mt-2">ログイン中: {user.email}</p>
          )}
        </header>

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* カメラ/アップロードセクション */}
          {!selectedFile && (
            <div
              className={`space-y-4 ${isDragging ? '' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label
                htmlFor="camera-input"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-400/50 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
              >
                <Camera className="w-16 h-16 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-white text-xl font-semibold">カメラで撮影</span>
                <span className="text-gray-300 text-sm mt-2">タップして撮影開始</span>
              </label>
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <label
                htmlFor="file-input"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${isDragging
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-indigo-400/50 hover:bg-white/5'
                  }`}
              >
                <Upload className="w-12 h-12 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-white text-lg font-semibold">
                  {isDragging ? '📂 ここにドロップ' : 'ファイルから選択'}
                </span>
                {!isDragging && (
                  <span className="text-gray-300 text-sm mt-2">またはドラッグ&ドロップ</span>
                )}
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* プレビューと解析 */}
          {selectedFile && !receiptData && (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full h-auto max-h-96 object-contain rounded-2xl"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      解析中...
                    </>
                  ) : (
                    '✨ AI解析を開始'
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  キャンセル
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* 解析結果の編集と保存 */}
          {receiptData && (
            <div className="space-y-6">
              {saveSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl animate-pulse">
                  <CheckCircle className="w-5 h-5" />
                  保存しました！
                </div>
              )}

              <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">📝 解析結果</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">日付</label>
                    <input
                      type="date"
                      value={receiptData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">時間</label>
                    <input
                      type="time"
                      defaultValue={new Date().toTimeString().slice(0, 5)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">金額</label>
                  <input
                    type="number"
                    value={receiptData.amount}
                    onChange={(e) => handleChange('amount', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">店名</label>
                  <input
                    type="text"
                    value={receiptData.store || ''}
                    onChange={(e) => handleChange('store', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">カテゴリ</label>
                  <input
                    type="text"
                    value={receiptData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      保存中...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      保存完了
                    </>
                  ) : (
                    '💾 Firestoreに保存'
                  )}
                </button>
                <button
                  onClick={() => {
                    setReceiptData(null);
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  戻る
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <footer className="text-center mt-8 space-y-4">
          <Link
            href="/history"
            className="inline-block bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all font-semibold"
          >
            📊 経費履歴を見る
          </Link>
          <p className="text-gray-400 text-sm">Powered by Gemini Flash & Firebase</p>
        </footer>
      </div>
    </div>
  );
}
