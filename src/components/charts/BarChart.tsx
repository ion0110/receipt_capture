'use client';

interface BarChartProps {
    data: Array<{
        label: string;
        value: number;
    }>;
    isDark: boolean;
}

export default function BarChart({ data, isDark }: BarChartProps) {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-64 sm:h-80">
                {data.map((item, index) => {
                    const heightPercentage = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            {/* 金額表示 */}
                            {item.value > 0 && (
                                <div className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    ¥{item.value.toLocaleString()}
                                </div>
                            )}
                            {/* バー */}
                            <div className="w-full flex flex-col justify-end flex-1">
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                                    style={{ height: `${heightPercentage}%` }}
                                />
                            </div>
                            {/* ラベル */}
                            <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
