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

    // データが多い場合は間引く（最大20件に）
    const maxItems = 20;
    const step = data.length > maxItems ? Math.ceil(data.length / maxItems) : 1;
    const displayData = data.filter((_, i) => i % step === 0);

    // SVG設定
    const width = 100;
    const height = 60;
    const padding = 2;

    // ポイント座標を計算（%ベース）
    const points = displayData.map((item, index) => ({
        x: padding + ((width - padding * 2) / (displayData.length - 1 || 1)) * index,
        y: padding + (height - padding * 2) - ((item.value / maxValue) * (height - padding * 2)),
        value: item.value,
        label: item.label
    }));

    // パスを生成
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`
        : '';

    return (
        <div className="w-full">
            {/* SVGチャート */}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height: '180px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* グリッド線 */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="0.3" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="0.3" strokeDasharray="1,1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={isDark ? '#4b5563' : '#e5e7eb'} strokeWidth="0.3" />

                {/* エリア塗りつぶし */}
                <path d={areaD} fill="#10b981" fillOpacity="0.2" />

                {/* ライン */}
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* ポイント */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1" fill="#10b981" />
                ))}
            </svg>

            {/* X軸ラベル */}
            <div className="flex justify-between mt-1 px-1">
                {displayData.map((item, index) => (
                    <div
                        key={index}
                        className={`text-center flex-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        style={{ fontSize: '9px' }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
