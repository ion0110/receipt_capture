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

    // データが多い場合は間引いて表示（最大15件）
    const step = Math.ceil(data.length / 15);
    const displayData = data.filter((_, i) => i % step === 0);

    const chartHeight = 180;
    const chartWidth = 100;

    // ポイント座標を計算
    const points = displayData.map((item, index) => {
        const x = (index / (displayData.length - 1 || 1)) * chartWidth;
        const y = chartHeight - (item.value / maxValue) * chartHeight;
        return { x, y, value: item.value, label: item.label };
    });

    // SVGパスを生成
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // エリアパス
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`
        : '';

    return (
        <div style={{ width: '100%' }}>
            <svg
                width="100%"
                height="200px"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                style={{ display: 'block' }}
            >
                {/* グリッド線 */}
                <line x1="0" y1="0" x2={chartWidth} y2="0" stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="0.5" />
                <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="0.5" />

                {/* エリア */}
                <path d={areaPath} fill="#10b981" fillOpacity="0.2" />

                {/* ライン */}
                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* ポイント */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" />
                ))}
            </svg>

            {/* X軸ラベル */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                padding: '0 4px'
            }}>
                {displayData.map((item, index) => (
                    <span
                        key={index}
                        style={{
                            fontSize: '10px',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            textAlign: 'center',
                            flex: 1
                        }}
                    >
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
