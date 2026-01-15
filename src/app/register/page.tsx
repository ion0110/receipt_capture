'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail } from '@/lib/firebase';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // パスワード確認
        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            setIsLoading(false);
            return;
        }

        // パスワード長チェック
        if (password.length < 6) {
            setError('パスワードは6文字以上で入力してください');
            setIsLoading(false);
            return;
        }

        try {
            await signUpWithEmail(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || '登録に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📸 パシャッと経費
                    </h1>
                    <p className="text-gray-300">新規登録</p>
                </div>

                {/* 登録フォーム */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* メールアドレス */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* パスワード */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                パスワード（6文字以上）
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="パスワード"
                            />
                        </div>

                        {/* パスワード確認 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                パスワード（確認）
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="パスワード（確認）"
                            />
                        </div>

                        {/* エラー表示 */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* 登録ボタン */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    登録中...
                                </>
                            ) : (
                                <>
                                    <User className="w-5 h-5" />
                                    新規登録
                                </>
                            )}
                        </button>
                    </form>

                    {/* ログインリンク */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 text-sm">
                            すでにアカウントをお持ちの方は{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                                ログイン
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
