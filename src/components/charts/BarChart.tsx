'use client';

interface BarChartProps {
    data: Array<{
        label: string;
        value: number;
    }>;
    isDark: boolean;
}

export default function BarChart({ data, isDark }: BarChartProps) {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);

    // データが多い場合は間引く
    const step = data.length > 15 ? Math.ceil(data.length / 15) : 1;
    const displayData = data.filter((_, i) => i % step === 0);

    return (
        <div className="w-full overflow-x-auto">
            <div
                className="flex items-end gap-1"
                style={{
                    height: '220px',
                    minWidth: displayData.length > 12 ? `${displayData.length * 40}px` : 'auto'
                }}
            >
                {displayData.map((item, index) => {
                    const barHeight = maxValue > 0 ? Math.max((item.value / maxValue) * 160, item.value > 0 ? 4 : 0) : 0;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center flex-1"
                            style={{ minWidth: '28px' }}
                        >
                            {/* 金額 */}
                            <div
                                className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                style={{ height: '20px', fontSize: '9px' }}
                            >
                                {item.value > 0 ? `¥${item.value.toLocaleString()}` : ''}
                            </div>

                            {/* バーエリア */}
                            <div
                                className="flex items-end justify-center w-full"
                                style={{ height: '160px' }}
                            >
                                {/* バー */}
                                <div
                                    className="w-4/5 rounded-t"
                                    style={{
                                        height: `${barHeight}px`,
                                        background: 'linear-gradient(to top, #059669, #10b981, #34d399)',
                                        minWidth: '8px'
                                    }}
                                />
                            </div>

                            {/* ラベル */}
                            <div
                                className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                style={{ fontSize: '9px' }}
                            >
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
