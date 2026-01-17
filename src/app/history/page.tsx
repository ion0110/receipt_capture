'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Trash2, Calendar, Store, Tag, LogOut, Coins, Search, X, Moon, Sun } from 'lucide-react';
import { db, signOut } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

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
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

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

    // フィルタリングロジック
    const filteredReceipts = receipts.filter(receipt => {
        // 検索キーワードフィルター
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            const matchesStore = receipt.store?.toLowerCase().includes(keyword);
            const matchesCategory = receipt.category?.toLowerCase().includes(keyword);
            if (!matchesStore && !matchesCategory) return false;
        }
        // カテゴリフィルター
        if (selectedCategory && receipt.category !== selectedCategory) {
            return false;
        }
        return true;
    });

    // 合計金額計算（フィルター後）
    const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 flex items-center justify-center">
                <div className="text-white text-xl">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className={isDark ? 'min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50'}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* ヘッダー */}
                <header className="mb-8 md:mb-12">
                    {/* ボタン行 */}
                    <div className="flex justify-end gap-2 mb-4">
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
                            className={isDark ? 'bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all font-semibold flex items-center gap-2' : 'bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-all font-semibold flex items-center gap-2'}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">ログアウト</span>
                        </button>
                    </div>

                    {/* タイトル行 */}
                    <div className="text-center">
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            📊 経費履歴
                        </h1>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            登録された経費の一覧とエクスポート
                        </p>
                        {user && (
                            <p className={`text-xs sm:text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ログイン中: {user.email}</p>
                        )}
                    </div>
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
                                {filteredReceipts.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 検索・フィルターセクション */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 検索バー */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="店名やカテゴリで検索..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* カテゴリフィルター */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            <option value="" className="text-gray-900">すべてのカテゴリ</option>
                            <option value="食費" className="text-gray-900">食費</option>
                            <option value="交通費" className="text-gray-900">交通費</option>
                            <option value="書籍・文房具" className="text-gray-900">書籍・文房具</option>
                            <option value="日用品" className="text-gray-900">日用品</option>
                            <option value="衣類" className="text-gray-900">衣類</option>
                            <option value="医療費" className="text-gray-900">医療費</option>
                            <option value="娯楽" className="text-gray-900">娯楽</option>
                            <option value="通信費" className="text-gray-900">通信費</option>
                            <option value="光熱費" className="text-gray-900">光熱費</option>
                            <option value="その他" className="text-gray-900">その他</option>
                        </select>
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
                    {filteredReceipts.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
                            <p className="text-gray-300 text-lg">
                                {searchKeyword || selectedCategory ? '該当する経費が見つかりません' : 'まだ経費が登録されていません'}
                            </p>
                        </div>
                    ) : (
                        filteredReceipts.map((receipt) => (
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
