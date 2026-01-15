'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Trash2, Calendar, Store, Tag, LogOut, Coins } from 'lucide-react';
import { db, signOut } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

interface Receipt {
    id: string;
    date: string;
    amount: number;
    store?: string;
    category?: string;
    createdAt?: Timestamp;
}

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 未ログイン時はログインページにリダイレクト
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Firestoreからデータ取得
    useEffect(() => {
        if (user) {
            fetchReceipts();
        }
    }, [user]);

    const fetchReceipts = async () => {
        if (!user) return;

        try {
            // ユーザーID別にデータ取得
            const q = query(
                collection(db, 'receipts', user.uid, 'items'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const data: Receipt[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Receipt));
            setReceipts(data);
        } catch (error) {
            console.error('データ取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // CSV エクスポート
    const exportToCSV = () => {
        const headers = ['日付', '金額', '店名', 'カテゴリ'];
        const csvContent = [
            headers.join(','),
            ...receipts.map((r) =>
                [r.date, r.amount, r.store || '', r.category || ''].join(',')
            ),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `経費履歴_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // 削除
    const handleDelete = async (id: string) => {
        if (!confirm('本当に削除しますか？') || !user) return;

        try {
            await deleteDoc(doc(db, 'receipts', user.uid, 'items', id));
            setReceipts(receipts.filter((r) => r.id !== id));
        } catch (error) {
            console.error('削除エラー:', error);
        }
    };

    // 合計金額計算
    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 flex items-center justify-center">
                <div className="text-white text-xl">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* ヘッダー */}
                <header className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex-1"></div>
                        <h1 className="text-5xl font-bold text-white tracking-tight flex-1 text-center">
                            📊 経費履歴
                        </h1>
                        <div className="flex-1 flex justify-end">
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
                        登録された経費の一覧とエクスポート
                    </p>
                    {user && (
                        <p className="text-gray-400 text-sm text-center mt-2">ログイン中: {user.email}</p>
                    )}
                </header>

                {/* サマリーカード */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-300 text-sm mb-2">合計金額</p>
                            <p className="text-4xl font-bold text-white">
                                ¥{totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm mb-2">登録件数</p>
                            <p className="text-4xl font-bold text-emerald-400">
                                {receipts.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* エクスポートボタン */}
                <div className="mb-6">
                    <button
                        onClick={exportToCSV}
                        disabled={receipts.length === 0}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Download className="w-5 h-5" />
                        CSVエクスポート
                    </button>
                </div>

                {/* 履歴リスト */}
                <div className="space-y-4">
                    {receipts.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
                            <p className="text-gray-300 text-lg">まだ経費が登録されていません</p>
                        </div>
                    ) : (
                        receipts.map((receipt) => (
                            <div
                                key={receipt.id}
                                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/15 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {receipt.date}
                                                {receipt.createdAt && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        {new Date(receipt.createdAt.seconds * 1000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-5 h-5 text-emerald-400" />
                                            <span className="text-2xl font-bold text-white">
                                                ¥{receipt.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        {receipt.store && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Store className="w-4 h-4" />
                                                <span>{receipt.store}</span>
                                            </div>
                                        )}
                                        {receipt.category && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Tag className="w-4 h-4" />
                                                <span>{receipt.category}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(receipt.id)}
                                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 戻るボタン */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-block px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                        ← トップに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
