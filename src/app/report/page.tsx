'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, TrendingUp, Download, Printer, ArrowLeft, Sun, Moon, LogOut } from 'lucide-react';
import { db, signOut } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';

interface Receipt {
    id: string;
    date: string;
    amount: number;
    store?: string;
    category?: string;
}

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

interface TimeSeriesData {
    label: string;
    value: number;
}

interface ReportSummary {
    totalAmount: number;
    count: number;
    average: number;
    maxAmount: number;
    minAmount: number;
}

const categoryColors: Record<string, string> = {
    '食費': '#10b981',
    '交通費': '#3b82f6',
    '書籍・文房具': '#8b5cf6',
    '日用品': '#f59e0b',
    '衣類': '#ec4899',
    '医療費': '#ef4444',
    '娯楽': '#06b6d4',
    '通信費': '#6366f1',
    '光熱費': '#f97316',
    'その他': '#6b7280',
};

export default function ReportPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 未ログイン時はログインページにリダイレクト
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // データ取得
    useEffect(() => {
        if (user) {
            fetchReceipts();
        }
    }, [user, reportType, selectedYear, selectedMonth]);

    const fetchReceipts = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            let startDate: string;
            let endDate: string;

            if (reportType === 'monthly') {
                const year = selectedYear;
                const month = selectedMonth;
                startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
            } else {
                startDate = `${selectedYear}-01-01`;
                endDate = `${selectedYear}-12-31`;
            }

            const q = query(
                collection(db, `receipts/${user.uid}/items`),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Receipt[];

            setReceipts(data);
        } catch (error) {
            console.error('データ取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // カテゴリ別集計
    const getCategoryData = (): CategoryData[] => {
        const categoryMap = new Map<string, number>();
        let total = 0;

        receipts.forEach(receipt => {
            const category = receipt.category || 'その他';
            const current = categoryMap.get(category) || 0;
            categoryMap.set(category, current + receipt.amount);
            total += receipt.amount;
        });

        return Array.from(categoryMap.entries())
            .map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? (value / total) * 100 : 0,
                color: categoryColors[name] || categoryColors['その他']
            }))
            .sort((a, b) => b.value - a.value);
    };

    // 時系列データ
    const getTimeSeriesData = (): TimeSeriesData[] => {
        if (reportType === 'monthly') {
            // 日別集計
            const dayMap = new Map<number, number>();
            const year = selectedYear;
            const month = selectedMonth;
            const lastDay = new Date(year, month, 0).getDate();

            // 全日を初期化
            for (let day = 1; day <= lastDay; day++) {
                dayMap.set(day, 0);
            }

            receipts.forEach(receipt => {
                const date = new Date(receipt.date);
                const day = date.getDate();
                const current = dayMap.get(day) || 0;
                dayMap.set(day, current + receipt.amount);
            });

            return Array.from(dayMap.entries()).map(([day, value]) => ({
                label: `${day}日`,
                value
            }));
        } else {
            // 月別集計
            const monthMap = new Map<number, number>();

            // 全月を初期化
            for (let month = 1; month <= 12; month++) {
                monthMap.set(month, 0);
            }

            receipts.forEach(receipt => {
                const date = new Date(receipt.date);
                const month = date.getMonth() + 1;
                const current = monthMap.get(month) || 0;
                monthMap.set(month, current + receipt.amount);
            });

            return Array.from(monthMap.entries()).map(([month, value]) => ({
                label: `${month}月`,
                value
            }));
        }
    };

    // サマリー計算
    const getSummary = (): ReportSummary => {
        if (receipts.length === 0) {
            return {
                totalAmount: 0,
                count: 0,
                average: 0,
                maxAmount: 0,
                minAmount: 0
            };
        }

        const amounts = receipts.map(r => r.amount);
        return {
            totalAmount: amounts.reduce((sum, a) => sum + a, 0),
            count: receipts.length,
            average: amounts.reduce((sum, a) => sum + a, 0) / receipts.length,
            maxAmount: Math.max(...amounts),
            minAmount: Math.min(...amounts)
        };
    };

    // CSVエクスポート
    const exportCSV = () => {
        const categoryData = getCategoryData();
        const summary = getSummary();

        const csv = [
            ['カテゴリ', '金額', '割合'],
            ...categoryData.map(item => [
                item.name,
                item.value.toString(),
                `${item.percentage.toFixed(1)}%`
            ]),
            ['', '', ''],
            ['合計', summary.totalAmount.toString(), '100%'],
            ['件数', summary.count.toString(), ''],
            ['平均', Math.round(summary.average).toString(), '']
        ].map(row => row.join(',')).join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${selectedYear}_${reportType === 'monthly' ? selectedMonth : 'yearly'}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const categoryData = getCategoryData();
    const timeSeriesData = getTimeSeriesData();
    const summary = getSummary();

    if (loading || isLoading) {
        return (
            <div className={isDark ? 'min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 flex items-center justify-center' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center'}>
                <div className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>読み込み中...</div>
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
                            📈 経費レポート
                        </h1>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            月次・年次の経費分析
                        </p>
                    </div>
                </header>

                {/* 期間選択 */}
                <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 mb-8' : 'bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200 mb-8'}>
                    <div className="space-y-4">
                        {/* レポート種別 */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setReportType('monthly')}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${reportType === 'monthly'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                    : isDark
                                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                月次レポート
                            </button>
                            <button
                                onClick={() => setReportType('yearly')}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${reportType === 'yearly'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                    : isDark
                                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                年次レポート
                            </button>
                        </div>

                        {/* 期間選択 */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>年</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className={isDark ? 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none' : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none'}
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year} className="text-gray-900">{year}年</option>
                                    ))}
                                </select>
                            </div>
                            {reportType === 'monthly' && (
                                <div className="flex-1">
                                    <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>月</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className={isDark ? 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none' : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none'}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month} className="text-gray-900">{month}月</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* サマリーカード */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20' : 'bg-white rounded-2xl p-4 shadow-lg border border-gray-200'}>
                        <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>合計金額</p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ¥{summary.totalAmount.toLocaleString()}
                        </p>
                    </div>
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20' : 'bg-white rounded-2xl p-4 shadow-lg border border-gray-200'}>
                        <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>件数</p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {summary.count}
                        </p>
                    </div>
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20' : 'bg-white rounded-2xl p-4 shadow-lg border border-gray-200'}>
                        <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>平均</p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ¥{Math.round(summary.average).toLocaleString()}
                        </p>
                    </div>
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20' : 'bg-white rounded-2xl p-4 shadow-lg border border-gray-200'}>
                        <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>最大</p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ¥{summary.maxAmount.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* カテゴリ別集計 */}
                {categoryData.length > 0 && (
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 mb-8' : 'bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200 mb-8'}>
                        <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>カテゴリ別集計</h2>

                        {/* 円グラフ */}
                        <div className="mb-8">
                            <PieChart data={categoryData} isDark={isDark} />
                        </div>

                        {/* プログレスバー表示 */}
                        <div className="space-y-3">
                            {categoryData.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                            <span className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>¥{item.value.toLocaleString()}</span>
                                        </div>
                                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 時系列推移グラフ */}
                {timeSeriesData.length > 0 && (
                    <div className={isDark ? 'bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 mb-8' : 'bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200 mb-8'}>
                        <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {reportType === 'monthly' ? '日別推移' : '月別推移'}
                        </h2>

                        {/* タブ切り替え */}
                        <div className="flex gap-4 mb-6">
                            <button className="flex-1 py-2 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                棒グラフ
                            </button>
                            <button className={`flex-1 py-2 px-4 rounded-xl font-semibold ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                折れ線グラフ
                            </button>
                        </div>

                        {/* 棒グラフ */}
                        <div className="mb-4">
                            <BarChart data={timeSeriesData} isDark={isDark} />
                        </div>

                        {/* 折れ線グラフ */}
                        <div className="mt-8">
                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>推移グラフ</h3>
                            <LineChart data={timeSeriesData} isDark={isDark} />
                        </div>
                    </div>
                )}

                {/* エクスポートボタン */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={exportCSV}
                        disabled={receipts.length === 0}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 sm:py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Download className="w-5 h-5" />
                        CSVエクスポート
                    </button>
                    <button
                        onClick={() => window.print()}
                        disabled={receipts.length === 0}
                        className={isDark ? 'flex-1 bg-white/10 text-white font-bold py-3 sm:py-4 px-6 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2' : 'flex-1 bg-gray-200 text-gray-800 font-bold py-3 sm:py-4 px-6 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'}
                    >
                        <Printer className="w-5 h-5" />
                        印刷
                    </button>
                </div>

                {/* 戻るボタン */}
                <div className="text-center">
                    <Link
                        href="/history"
                        className={isDark ? 'inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold' : 'inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        履歴に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
