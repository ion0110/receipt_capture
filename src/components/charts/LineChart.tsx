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

    // SVG設定
    const svgWidth = 100;
    const svgHeight = 50;
    const padding = { top: 5, bottom: 8, left: 5, right: 5 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // ポイントを計算
    const points = data.map((item, index) => {
        const x = padding.left + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;
        return { x, y, value: item.value, label: item.label };
    });

    // SVGパスを生成
    const linePath = points.map((point, index) => {
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ');

    // エリアパスを生成
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    // ラベル表示用のデータを間引く（最大8件）
    const labelStep = Math.ceil(data.length / 8);
    const displayLabels = data.filter((_, i) => i % labelStep === 0);

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full"
                style={{ height: '180px', maxHeight: '220px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* グリッド線 */}
                {[0, 50, 100].map((percent) => {
                    const y = padding.top + chartHeight - (chartHeight * percent) / 100;
                    return (
                        <line
                            key={percent}
                            x1={padding.left}
                            y1={y}
                            x2={svgWidth - padding.right}
                            y2={y}
                            stroke={isDark ? '#374151' : '#e5e7eb'}
                            strokeWidth="0.15"
                            strokeDasharray="0.5,0.5"
                        />
                    );
                })}

                {/* グラデーション定義 */}
                <defs>
                    <linearGradient id="lineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* エリア（グラデーション） */}
                <path
                    d={areaPath}
                    fill="url(#lineAreaGradient)"
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
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={point.value > 0 ? 0.8 : 0.4}
                        fill={point.value > 0 ? '#10b981' : isDark ? '#374151' : '#e5e7eb'}
                    />
                ))}
            </svg>

            {/* X軸ラベル */}
            <div className="flex justify-between mt-2 px-1">
                {displayLabels.map((item, index) => (
                    <span
                        key={index}
                        className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
