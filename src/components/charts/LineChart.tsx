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

    // データが多い場合は間引く
    const step = data.length > 15 ? Math.ceil(data.length / 15) : 1;
    const displayData = data.filter((_, i) => i % step === 0);

    const chartHeight = 160;
    const chartWidth = 800;
    const pointSpacing = chartWidth / (displayData.length - 1 || 1);

    // ポイント座標を計算
    const points = displayData.map((item, index) => ({
        x: index * pointSpacing,
        y: chartHeight - (item.value / maxValue) * chartHeight,
        value: item.value,
        label: item.label
    }));

    // パスを生成
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <div className="w-full">
            {/* SVGチャート */}
            <div className="w-full overflow-x-auto">
                <svg
                    width="100%"
                    height="180"
                    viewBox={`-10 -10 ${chartWidth + 20} ${chartHeight + 20}`}
                    style={{ minWidth: displayData.length > 12 ? `${displayData.length * 50}px` : '100%' }}
                >
                    {/* グリッド線 */}
                    <line x1="0" y1="0" x2={chartWidth} y2="0" stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="1" />
                    <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="1" />

                    {/* エリア塗りつぶし */}
                    <path
                        d={areaD}
                        fill="#10b981"
                        fillOpacity="0.2"
                    />

                    {/* ライン */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* ポイント */}
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#10b981"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    ))}
                </svg>
            </div>

            {/* X軸ラベル */}
            <div
                className="flex justify-between mt-2"
                style={{ minWidth: displayData.length > 12 ? `${displayData.length * 50}px` : '100%' }}
            >
                {displayData.map((item, index) => (
                    <div
                        key={index}
                        className={`text-xs text-center flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        style={{ fontSize: '10px' }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
