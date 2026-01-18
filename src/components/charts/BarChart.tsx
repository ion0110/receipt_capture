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

    // データが多い場合は間引く（最大20件に）
    const maxItems = 20;
    const step = data.length > maxItems ? Math.ceil(data.length / maxItems) : 1;
    const displayData = data.filter((_, i) => i % step === 0);

    // バーの幅を計算
    const barWidth = Math.max(100 / displayData.length - 1, 3);

    return (
        <div className="w-full">
            {/* バーチャート */}
            <div
                className="flex items-end justify-around gap-px"
                style={{ height: '180px' }}
            >
                {displayData.map((item, index) => {
                    const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center"
                            style={{ width: `${barWidth}%` }}
                        >
                            {/* 金額ラベル */}
                            {item.value > 0 && (
                                <div
                                    className={`text-center mb-1 truncate w-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                    style={{ fontSize: '8px', height: '14px' }}
                                >
                                    ¥{item.value.toLocaleString()}
                                </div>
                            )}
                            {item.value === 0 && <div style={{ height: '14px' }} />}

                            {/* バー */}
                            <div
                                className="w-full flex items-end justify-center"
                                style={{ height: '140px' }}
                            >
                                <div
                                    className="rounded-t"
                                    style={{
                                        width: '80%',
                                        height: `${Math.max(heightPercent, item.value > 0 ? 2 : 0)}%`,
                                        background: item.value > 0 ? 'linear-gradient(to top, #059669, #10b981)' : 'transparent',
                                        minHeight: item.value > 0 ? '3px' : '0'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* X軸ラベル */}
            <div className="flex justify-around mt-1">
                {displayData.map((item, index) => (
                    <div
                        key={index}
                        className={`text-center truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        style={{ width: `${barWidth}%`, fontSize: '9px' }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
