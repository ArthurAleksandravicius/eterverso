type Stats = {
    Go?: number;
    Gi?: number;
    Tai?: number;
    Chi?: number;
    Shin?: number;
    Ki?: number;
    Soku?: number;
    Un?: number;
};

type Props = {
    stats: Stats;
};

const STAT_LABELS = [
    { key: 'acg', kanji: '剛', label: 'Gō' },
    { key: 'ccm', kanji: '技', label: 'Gi' },
    { key: 'ceo', kanji: '体', label: 'Tai' },
    { key: 'fdv', kanji: '知', label: 'Chi' },
    { key: 'icf', kanji: '心', label: 'Shin' },
    { key: 'ifc', kanji: '気', label: 'Ki' },
    { key: 'lrb', kanji: '速', label: 'Soku' },
    { key: 'tpc', kanji: '運', label: 'Un' }
];

export default function ApexScaleChart({ stats }: Props) {
    const size = 260;
    const center = size / 2;
    const maxRadius = 90;

    const values = STAT_LABELS.map(s => {
        const val = (stats as any)[s.key] || (stats as any)[s.key.toLowerCase()] || 0;
        return Math.min(100, Math.max(0, val));
    });

    const getCoordinatesForAngle = (angleDeg: number, radius: number) => {
        const angleRad = (angleDeg - 90) * Math.PI / 180;
        return {
            x: center + radius * Math.cos(angleRad),
            y: center + radius * Math.sin(angleRad)
        };
    };

    const angles = Array.from({ length: 8 }).map((_, i) => i * 45);

    const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
        return angles.map(angle => getCoordinatesForAngle(angle, maxRadius * scale));
    });

    const dataPoints = angles.map((angle, i) => getCoordinatesForAngle(angle, maxRadius * (values[i] / 100)));
    const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + ' Z';

    return (
        <div className="bg-[#f0f4f8] w-full border border-[#aab7d3] rounded-sm overflow-hidden mt-4">
            <div className="bg-[#1f3765] text-[#ffcc00] font-bold py-[4px] px-[10px] text-[13px]">
                Apex Scale
            </div>

            <div className="flex flex-col justify-around md:flex-row p-4 gap-6 items-center">
                <div className="relative shrink-0" style={{ width: size, height: size }}>
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-white to-[#d4dbe4] shadow-inner" style={{ transform: 'scale(1.05)' }}></div>

                    <svg width={size} height={size} className="relative z-10">
                        {/* Desenhar os eixos */}
                        {angles.map((angle, i) => {
                            const p = getCoordinatesForAngle(angle, maxRadius);
                            return <line key={`axis-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#c3d0e2" strokeWidth="1" />
                        })}

                        {/* Anéis */}
                        {rings.map((ring, i) => (
                            <polygon key={`ring-${i}`} points={ring.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#c3d0e2" strokeWidth="1" />
                        ))}

                        <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(60, 100, 160, 0.4)" stroke="#1f3765" strokeWidth="2" />

                        {dataPoints.map((p, i) => (
                            <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="3" fill="#1f3765" />
                        ))}

                        {/* Draw labels */}
                        {angles.map((angle, i) => {
                            const p = getCoordinatesForAngle(angle, maxRadius + 20); // Push labels out
                            return (
                                <g key={`label-${i}`} transform={`translate(${p.x}, ${p.y})`}>
                                    <text textAnchor="middle" y="-4" className="text-[12px] font-bold fill-[#1f3765]">{STAT_LABELS[i].kanji}</text>
                                    <text textAnchor="middle" y="8" className="text-[10px] fill-[#555]">{STAT_LABELS[i].label}</text>
                                </g>
                            )
                        })}
                    </svg>
                </div>

                {/* Barras de progresso */}
                <div className="flex-1 flex flex-col gap-[6px] max-w-[50%] min-w-[200px]">
                    {STAT_LABELS.map((stat, i) => (
                        <div key={stat.key} className="flex items-center gap-3">
                            <div className="w-[30px] text-right shrink-0">
                                <div className="font-bold text-[11px] text-[#1f3765] leading-none">{stat.kanji}</div>
                                <div className="text-[9px] text-[#555]">{stat.label}</div>
                            </div>

                            <div className="flex-1 h-[10px] bg-[#d4dbe4] rounded-full overflow-hidden shadow-inner flex">
                                <div className="h-full bg-linear-to-r from-[#3c64a0] to-[#1f3765]" style={{ width: `${values[i]}%` }}></div>
                            </div>

                            <div className="w-[20px] text-[11px] font-bold text-[#333] shrink-0 text-right">
                                {values[i]}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
