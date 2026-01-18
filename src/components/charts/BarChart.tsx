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

    // 値のあるデータのみを抽出
    const hasData = data.some(d => d.value > 0);
    if (!hasData) {
        return (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                この期間のデータはありません
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    // データが多い場合は間引いて表示（最大12件）
    const step = Math.ceil(data.length / 12);
    const displayData = data.filter((_, i) => i % step === 0);

    // SVGで描画
    const svgWidth = 100;
    const svgHeight = 60;
    const barPadding = 2;
    const labelHeight = 10;
    const chartHeight = svgHeight - labelHeight;
    const barWidth = (svgWidth - barPadding * 2) / displayData.length;

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full"
                style={{ height: '200px', maxHeight: '250px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* グリッド線 */}
                {[0, 25, 50, 75, 100].map((percent) => {
                    const y = chartHeight - (chartHeight * percent) / 100;
                    return (
                        <line
                            key={percent}
                            x1={barPadding}
                            y1={y}
                            x2={svgWidth - barPadding}
                            y2={y}
                            stroke={isDark ? '#374151' : '#e5e7eb'}
                            strokeWidth="0.2"
                            strokeDasharray={percent === 0 ? '' : '1,1'}
                        />
                    );
                })}

                {/* バー */}
                {displayData.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (chartHeight - 5);
                    const x = barPadding + index * barWidth + barWidth * 0.1;
                    const y = chartHeight - barHeight;
                    const width = barWidth * 0.8;

                    return (
                        <g key={index}>
                            {/* バー本体 */}
                            <rect
                                x={x}
                                y={y}
                                width={width}
                                height={Math.max(barHeight, 0)}
                                fill="url(#barGradient)"
                                rx="0.5"
                            />
                            {/* 金額ラベル（値がある場合のみ） */}
                            {item.value > 0 && (
                                <text
                                    x={x + width / 2}
                                    y={y - 1}
                                    textAnchor="middle"
                                    className={isDark ? 'fill-gray-300' : 'fill-gray-700'}
                                    fontSize="2.5"
                                    fontWeight="600"
                                >
                                    ¥{item.value.toLocaleString()}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* グラデーション定義 */}
                <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </svg>

            {/* X軸ラベル */}
            <div className="flex justify-between mt-2 px-1">
                {displayData.map((item, index) => (
                    <span
                        key={index}
                        className={`text-[10px] sm:text-xs text-center flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
