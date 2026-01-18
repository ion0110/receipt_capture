'use client';

interface LineChartProps {
    data: Array<{
        label: string;
        value: number;
    }>;
    isDark: boolean;
}

export default function LineChart({ data, isDark }: LineChartProps) {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const padding = 10;
    const width = 100 - padding * 2;
    const height = 60;

    // ポイントを計算
    const points = data.map((item, index) => {
        const x = padding + (width / (data.length - 1 || 1)) * index;
        const y = padding + height - (item.value / maxValue) * height;
        return { x, y, value: item.value, label: item.label };
    });

    // SVGパスを生成
    const linePath = points.map((point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }
        return `L ${point.x} ${point.y}`;
    }).join(' ');

    // エリアパスを生成（グラデーション用）
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + height} L ${points[0].x} ${padding + height} Z`;

    return (
        <div className="w-full">
            <svg viewBox="0 0 100 80" className="w-full h-auto">
                {/* グリッド線 */}
                {[0, 25, 50, 75, 100].map((percent) => {
                    const y = padding + height - (height * percent) / 100;
                    return (
                        <line
                            key={percent}
                            x1={padding}
                            y1={y}
                            x2={100 - padding}
                            y2={y}
                            stroke={isDark ? '#374151' : '#e5e7eb'}
                            strokeWidth="0.2"
                        />
                    );
                })}

                {/* エリア（グラデーション） */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={areaPath}
                    fill="url(#areaGradient)"
                />

                {/* 折れ線 */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* ポイント */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="1"
                            fill="#10b981"
                            className="transition-all hover:r-1.5 cursor-pointer"
                        />
                        {point.value > 0 && (
                            <text
                                x={point.x}
                                y={point.y - 2}
                                textAnchor="middle"
                                className={`text-[2px] font-semibold ${isDark ? 'fill-gray-300' : 'fill-gray-700'}`}
                            >
                                ¥{point.value.toLocaleString()}
                            </text>
                        )}
                    </g>
                ))}
            </svg>

            {/* X軸ラベル */}
            <div className="flex justify-between mt-2 px-2">
                {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((item, index) => (
                    <span key={index} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
