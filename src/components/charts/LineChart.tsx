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
    const height = 50; // 高さを小さく

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

    // ラベル表示用のデータを間引く
    const labelStep = Math.ceil(data.length / 6); // さらに間引く
    const displayLabels = data.filter((_, i) => i % labelStep === 0);

    return (
        <div className="w-full">
            <svg viewBox="0 0 100 70" className="w-full h-auto" style={{ maxHeight: '150px' }}>
                {/* グリッド線 */}
                {[0, 50, 100].map((percent) => {
                    const y = padding + height - (height * percent) / 100;
                    return (
                        <line
                            key={percent}
                            x1={padding}
                            y1={y}
                            x2={100 - padding}
                            y2={y}
                            stroke={isDark ? '#374151' : '#e5e7eb'}
                            strokeWidth="0.3"
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
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* ポイント */}
                {points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="1.2"
                        fill="#10b981"
                        className="transition-all"
                    />
                ))}
            </svg>

            {/* X軸ラベル */}
            <div className="flex justify-between mt-1 px-1">
                {displayLabels.map((item, index) => (
                    <span key={index} className={`text-[9px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
