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

    // 表示用データ（間引きなし、全て表示）
    const displayData = data;

    // 棒の数に応じた幅を計算
    const barCount = displayData.length;

    return (
        <div className="w-full overflow-x-auto">
            <div
                className="flex items-end"
                style={{
                    height: '200px',
                    minWidth: barCount > 15 ? `${barCount * 25}px` : '100%'
                }}
            >
                {displayData.map((item, index) => {
                    // 高さをピクセルで計算（最大150px）
                    const barHeightPx = maxValue > 0 ? Math.round((item.value / maxValue) * 150) : 0;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-end flex-1"
                            style={{ minWidth: '20px', height: '100%' }}
                        >
                            {/* 金額ラベル（値がある場合のみ） */}
                            <div
                                style={{
                                    height: '25px',
                                    fontSize: '7px',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center'
                                }}
                                className={isDark ? 'text-gray-300' : 'text-gray-700'}
                            >
                                {item.value > 0 && `¥${item.value.toLocaleString()}`}
                            </div>

                            {/* バー */}
                            <div
                                style={{
                                    width: '70%',
                                    height: item.value > 0 ? `${Math.max(barHeightPx, 4)}px` : '0px',
                                    background: item.value > 0 ? 'linear-gradient(to top, #059669, #34d399)' : 'transparent',
                                    borderRadius: '3px 3px 0 0',
                                    transition: 'height 0.3s ease'
                                }}
                            />

                            {/* ラベル */}
                            <div
                                style={{
                                    height: '20px',
                                    fontSize: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                className={isDark ? 'text-gray-400' : 'text-gray-600'}
                            >
                                {item.label.replace('日', '').replace('月', '')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
