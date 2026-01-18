'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, BarChart3, LogOut, Sun, Moon } from 'lucide-react';
import { signOut } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // ログイン/登録ページではヘッダーを表示しない
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const navItems = [
        { href: '/', label: 'ホーム', icon: Home },
        { href: '/history', label: '履歴', icon: FileText },
        { href: '/report', label: 'レポート', icon: BarChart3 },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-slate-900/95 border-b border-white/10' : 'bg-white/95 border-b border-gray-200'} backdrop-blur-md`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* ロゴ */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">📸</span>
                        <span className={`text-lg font-bold hidden sm:inline ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            パシャッと経費
                        </span>
                    </Link>

                    {/* ナビゲーション */}
                    <nav className="flex items-center gap-2 sm:gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-emerald-500 text-white'
                                            : isDark
                                                ? 'text-gray-300 hover:bg-white/10'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* テーマ切り替え */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                            title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
                        >
                            {isDark ? <Sun className="w-4 h-4 text-gray-300" /> : <Moon className="w-4 h-4 text-gray-700" />}
                        </button>

                        {/* ログアウト */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg transition-all ${isDark
                                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline text-sm font-medium">ログアウト</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
