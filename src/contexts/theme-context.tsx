'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'default' | 'blue' | 'pink' | 'orange';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'default', setTheme: () => { } });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('default');

    // LocalStorageからテーマを読み込み
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
    }, []);

    // テーマ変更時にLocalStorageに保存
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

// テーマカラー定義
export const themes = {
    default: {
        gradient: 'from-indigo-950 via-slate-900 to-emerald-950',
        primary: 'from-emerald-500 to-teal-500',
        primaryHover: 'from-emerald-600 to-teal-600',
        accent: 'emerald',
    },
    blue: {
        gradient: 'from-blue-950 via-slate-900 to-cyan-950',
        primary: 'from-blue-500 to-cyan-500',
        primaryHover: 'from-blue-600 to-cyan-600',
        accent: 'blue',
    },
    pink: {
        gradient: 'from-pink-950 via-slate-900 to-rose-950',
        primary: 'from-pink-500 to-rose-500',
        primaryHover: 'from-pink-600 to-rose-600',
        accent: 'pink',
    },
    orange: {
        gradient: 'from-orange-950 via-slate-900 to-amber-950',
        primary: 'from-orange-500 to-amber-500',
        primaryHover: 'from-orange-600 to-amber-600',
        accent: 'orange',
    },
};
