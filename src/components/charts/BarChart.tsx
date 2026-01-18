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

    // データが多い場合は間引いて表示
    const displayData = data.length > 15
        ? data.filter((_, i) => i % Math.ceil(data.length / 15) === 0)
        : data;

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-full" style={{ minWidth: `${displayData.length * 40}px` }}>
                <div className="flex items-end justify-between gap-1 h-48 sm:h-64 px-2">
                    {displayData.map((item, index) => {
                        const heightPercentage = (item.value / maxValue) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-0">
                                {/* 金額表示 */}
                                {item.value > 0 && (
                                    <div className={`text-[10px] sm:text-xs font-semibold truncate w-full text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                                <div className={`text-[10px] sm:text-xs font-medium truncate w-full text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
