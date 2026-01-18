'use client';

interface PieChartProps {
    data: Array<{
        name: string;
        value: number;
        percentage: number;
        color: string;
    }>;
    isDark: boolean;
}

export default function PieChart({ data, isDark }: PieChartProps) {
    if (data.length === 0) return null;

    // 円グラフのセグメントを計算
    let currentAngle = -90; // 12時の位置から開始
    const segments = data.map(item => {
        const angle = (item.percentage / 100) * 360;
        const segment = {
            ...item,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            angle
        };
        currentAngle += angle;
        return segment;
    });

    // SVGパスを生成
    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(50, 50, 40, endAngle);
        const end = polarToCartesian(50, 50, 40, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-auto">
                {segments.map((segment, index) => (
                    <g key={index}>
                        <path
                            d={createArc(segment.startAngle, segment.endAngle)}
                            fill={segment.color}
                            className="transition-opacity hover:opacity-80 cursor-pointer"
                        />
                    </g>
                ))}
                {/* 中央の円（ドーナツグラフ風） */}
                <circle
                    cx="50"
                    cy="50"
                    r="20"
                    fill={isDark ? '#1e293b' : '#ffffff'}
                    className="transition-colors"
                />
            </svg>

            {/* 凡例 */}
            <div className="mt-6 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.name}
                        </span>
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.percentage.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
