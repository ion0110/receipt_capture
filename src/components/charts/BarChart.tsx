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

    // データが多い場合は間引いて表示（最大15件）
    const step = Math.ceil(data.length / 15);
    const displayData = data.filter((_, i) => i % step === 0);

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                height: '200px',
                padding: '0 8px',
                minWidth: displayData.length > 10 ? `${displayData.length * 50}px` : '100%'
            }}>
                {displayData.map((item, index) => {
                    const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%',
                                minWidth: '30px'
                            }}
                        >
                            {/* 金額ラベル */}
                            {item.value > 0 && (
                                <div style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: isDark ? '#d1d5db' : '#374151',
                                    marginBottom: '4px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ¥{item.value.toLocaleString()}
                                </div>
                            )}

                            {/* バーコンテナ */}
                            <div style={{
                                flex: 1,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'flex-end'
                            }}>
                                {/* バー本体 */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${heightPercent}%`,
                                        minHeight: item.value > 0 ? '4px' : '0px',
                                        background: 'linear-gradient(to top, #10b981, #2dd4bf)',
                                        borderRadius: '4px 4px 0 0'
                                    }}
                                />
                            </div>

                            {/* 日付ラベル */}
                            <div style={{
                                fontSize: '10px',
                                color: isDark ? '#9ca3af' : '#6b7280',
                                marginTop: '4px',
                                whiteSpace: 'nowrap'
                            }}>
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
