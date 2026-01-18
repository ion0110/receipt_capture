'use client';

interface LineChartProps {
    data: Array<{
        label: string;
        value: number;
    }>;
    isDark: boolean;
}

export default function LineChart({ data, isDark }: LineChartProps) {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const displayData = data;

    // SVG設定（ピクセルベース）
    const svgWidth = 600;
    const svgHeight = 180;
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // ポイント座標を計算
    const points = displayData.map((item, index) => {
        const x = padding.left + (chartWidth / (displayData.length - 1 || 1)) * index;
        const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;
        return { x, y, value: item.value, label: item.label };
    });

    // パスを生成
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

    // ラベル表示間隔
    const labelInterval = Math.ceil(displayData.length / 10);

    return (
        <div className="w-full overflow-x-auto">
            <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ minWidth: displayData.length > 15 ? `${displayData.length * 25}px` : '100%' }}
            >
                {/* グリッド線 */}
                <line
                    x1={padding.left} y1={padding.top}
                    x2={svgWidth - padding.right} y2={padding.top}
                    stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="1"
                />
                <line
                    x1={padding.left} y1={padding.top + chartHeight / 2}
                    x2={svgWidth - padding.right} y2={padding.top + chartHeight / 2}
                    stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="1" strokeDasharray="4,4"
                />
                <line
                    x1={padding.left} y1={padding.top + chartHeight}
                    x2={svgWidth - padding.right} y2={padding.top + chartHeight}
                    stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="1"
                />

                {/* エリア塗りつぶし */}
                <path d={areaPath} fill="#10b981" fillOpacity="0.15" />

                {/* ライン */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* ポイント */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={p.value > 0 ? 4 : 2}
                        fill={p.value > 0 ? '#10b981' : isDark ? '#4b5563' : '#d1d5db'}
                        stroke={p.value > 0 ? '#fff' : 'none'}
                        strokeWidth={p.value > 0 ? 1 : 0}
                    />
                ))}

                {/* X軸ラベル */}
                {points.map((p, i) => {
                    if (i % labelInterval !== 0) return null;
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={svgHeight - 8}
                            textAnchor="middle"
                            fill={isDark ? '#9ca3af' : '#6b7280'}
                            fontSize="10"
                        >
                            {p.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
