import React from 'react';

export const FractionDisplay: React.FC<{
  whole?: number;
  num: number;
  den: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorClass?: string;
}> = ({ whole, num, den, size = 'md', colorClass = 'text-[#082545]' }) => {
  const sizeStyles = {
    sm: { whole: 'text-sm', frac: 'text-xs', pad: 'px-1' },
    md: { whole: 'text-lg', frac: 'text-sm', pad: 'px-1.5' },
    lg: { whole: 'text-2xl', frac: 'text-lg', pad: 'px-2' },
    xl: { whole: 'text-3xl', frac: 'text-xl', pad: 'px-2.5' },
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono tabular-nums font-extrabold align-middle ${colorClass}`}
    >
      {whole !== undefined && whole !== 0 && (
        <span className={sizeStyles.whole}>{whole}</span>
      )}
      <span className={`inline-flex flex-col items-center leading-none ${sizeStyles.pad}`}>
        <span className={`${sizeStyles.frac} pb-1`}>{num}</span>
        <span className="h-[2.5px] w-full min-w-[1.35rem] bg-current rounded-full" />
        <span className={`${sizeStyles.frac} pt-1`}>{den}</span>
      </span>
    </span>
  );
};

/**
 * Renders text while automatically converting mixed fractions (e.g. "1 3/4")
 * and simple fractions (e.g. "3/4") into proper vertical mathematical fraction notation.
 */
export const MathText: React.FC<{
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ text, size = 'md', className = '' }) => {
  if (!text) return null;

  // Match either mixed fraction like "2 3/4" or simple fraction like "3/4" (excluding dates/words)
  const regex = /\b(\d+)\s+(\d+)\/(\d+)\b|\b(\d+)\/(\d+)\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined && match[3] !== undefined) {
      parts.push(
        <FractionDisplay
          key={`${match.index}-mixed`}
          whole={Number(match[1])}
          num={Number(match[2])}
          den={Number(match[3])}
          size={size}
          colorClass="text-current"
        />
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      parts.push(
        <FractionDisplay
          key={`${match.index}-simple`}
          num={Number(match[4])}
          den={Number(match[5])}
          size={size}
          colorClass="text-current"
        />
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={`inline leading-relaxed ${className}`}>{parts}</span>;
};

export const FractionBar3D: React.FC<{
  num: number;
  den: number;
  subdivideToKpk?: number;
  color?: 'azure' | 'emerald' | 'amber' | 'coral' | 'indigo';
  label?: string;
  onSegmentClick?: (newNum: number) => void;
}> = ({ num, den, subdivideToKpk, color = 'azure', label, onSegmentClick }) => {
  const safeDen = Math.max(1, Math.min(24, Math.round(den)));
  const safeNum = Math.max(0, Math.min(safeDen * 2, Math.round(num)));

  const palette = {
    azure: { top: '#BAE6FD', front: '#0066DD', side: '#0044AA', emptyTop: '#FEFCE8', emptyFront: '#FEF9C3' },
    emerald: { top: '#BBF7D0', front: '#58CC02', side: '#3E9400', emptyTop: '#FEFCE8', emptyFront: '#FEF9C3' },
    amber: { top: '#FDE047', front: '#FF7A00', side: '#D94E00', emptyTop: '#FEFCE8', emptyFront: '#FEF9C3' },
    coral: { top: '#FCA5A5', front: '#DC2626', side: '#991B1B', emptyTop: '#FEFCE8', emptyFront: '#FEF9C3' },
    indigo: { top: '#FDE047', front: '#FFD60A', side: '#CA8A04', emptyTop: '#FEFCE8', emptyFront: '#FEF9C3' },
  }[color];

  const width = 380;
  const height = 70;
  const barX = 14;
  const barY = 20;
  const barW = 336;
  const barH = 36;
  const depthX = 10;
  const depthY = -10;
  const segW = barW / safeDen;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between text-sm font-extrabold text-[#082545] mb-1.5">
          <MathText text={label} size="sm" />
          <div className="flex items-center gap-2 text-[#0066DD]">
            <FractionDisplay num={safeNum} den={safeDen} size="sm" colorClass="text-[#0066DD]" />
          </div>
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none overflow-visible"
        role="img"
        aria-label={`Visualisasi Balok Pecahan ${safeNum} per ${safeDen}`}
      >
        <polygon
          points={`${barX + barW},${barY} ${barX + barW + depthX},${barY + depthY} ${barX + barW + depthX},${barY + barH + depthY} ${barX + barW},${barY + barH}`}
          fill={safeNum >= safeDen ? palette.side : '#E2E8F0'}
          stroke="#082545"
          strokeWidth="2"
        />

        {Array.from({ length: safeDen }).map((_, idx) => {
          const isFilled = idx < safeNum;
          const x = barX + idx * segW;
          const textFill = isFilled
            ? color === 'emerald' || color === 'indigo'
              ? '#082545'
              : '#FFFFFF'
            : '#082545';
          return (
            <g
              key={idx}
              className={onSegmentClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
              onClick={() => onSegmentClick && onSegmentClick(idx + 1 === safeNum ? idx : idx + 1)}
            >
              <polygon
                points={`${x},${barY} ${x + depthX},${barY + depthY} ${x + segW + depthX},${barY + depthY} ${x + segW},${barY}`}
                fill={isFilled ? palette.top : palette.emptyTop}
                stroke="#082545"
                strokeWidth="2"
              />
              <rect
                x={x}
                y={barY}
                width={segW}
                height={barH}
                fill={isFilled ? palette.front : palette.emptyFront}
                stroke="#082545"
                strokeWidth="2"
              />
              {/* Proper vertical fraction inside segment */}
              {safeDen <= 10 && (
                <g>
                  <text
                    x={x + segW / 2}
                    y={barY + 14}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontFamily="IBM Plex Mono, monospace"
                    fontWeight="800"
                    fill={textFill}
                  >
                    1
                  </text>
                  <line
                    x1={x + segW / 2 - 6}
                    y1={barY + 18}
                    x2={x + segW / 2 + 6}
                    y2={barY + 18}
                    stroke={textFill}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + segW / 2}
                    y={barY + 29}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontFamily="IBM Plex Mono, monospace"
                    fontWeight="800"
                    fill={textFill}
                  >
                    {safeDen}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {subdivideToKpk && subdivideToKpk > safeDen && subdivideToKpk <= 36 && (
          <g>
            {Array.from({ length: subdivideToKpk - 1 }).map((_, kIdx) => {
              const subX = barX + ((kIdx + 1) * barW) / subdivideToKpk;
              return (
                <line
                  key={kIdx}
                  x1={subX}
                  y1={barY}
                  x2={subX}
                  y2={barY + barH}
                  stroke="#082545"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  opacity="0.7"
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

export const FractionPie3D: React.FC<{
  num: number;
  den: number;
  color?: 'azure' | 'emerald' | 'amber' | 'coral';
  size?: number;
}> = ({ num, den, color = 'azure', size = 150 }) => {
  const safeDen = Math.max(1, Math.min(20, Math.round(den)));
  const safeNum = Math.max(0, Math.min(safeDen, Math.round(num)));

  const palette = {
    azure: { fill: '#FFD60A', sliceAccent: '#58CC02', rim: '#082545' },
    emerald: { fill: '#58CC02', sliceAccent: '#FFD60A', rim: '#082545' },
    amber: { fill: '#FF7A00', sliceAccent: '#FFD60A', rim: '#082545' },
    coral: { fill: '#DC2626', sliceAccent: '#FFD60A', rim: '#082545' },
  }[color];

  const cx = 80;
  const cy = 72;
  const r = 56;
  const depth = 12;

  const createSectorPath = (index: number, total: number) => {
    if (total === 1) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    }
    const startAngle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const endAngle = ((index + 1) * 2 * Math.PI) / total - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 156"
      className="select-none overflow-visible"
      role="img"
      aria-label={`Diagram Lingkaran 3D Pecahan ${safeNum} per ${safeDen}`}
    >
      <ellipse cx={cx} cy={cy + depth + 4} rx={r + 2} ry={r * 0.88} fill="rgba(8, 37, 69, 0.14)" />
      <circle
        cx={cx}
        cy={cy + depth}
        r={r}
        fill={safeNum > 0 ? palette.rim : '#CBD5E1'}
        stroke="#082545"
        strokeWidth="2.5"
      />
      {Array.from({ length: safeDen }).map((_, idx) => {
        const isFilled = idx < safeNum;
        return (
          <path
            key={idx}
            d={createSectorPath(idx, safeDen)}
            fill={isFilled ? (idx === 0 && safeNum > 1 ? palette.sliceAccent : palette.fill) : '#FFFDF7'}
            stroke="#082545"
            strokeWidth="2.2"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="5.5" fill="#FFFFFF" stroke="#082545" strokeWidth="2" />
    </svg>
  );
};

export const FractionNumberLine: React.FC<{
  fractions: Array<{ label: string; num: number; den: number; color: string }>;
  maxWhole?: number;
}> = ({ fractions, maxWhole = 1 }) => {
  const width = 560;
  const height = 104;
  const startX = 40;
  const endX = width - 40;
  const lineY = 52;
  const spanW = endX - startX;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
      <line
        x1={startX}
        y1={lineY}
        x2={endX}
        y2={lineY}
        stroke="#082545"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {Array.from({ length: maxWhole + 1 }).map((_, w) => {
        const x = startX + (w / maxWhole) * spanW;
        return (
          <g key={w}>
            <line x1={x} y1={lineY - 9} x2={x} y2={lineY + 9} stroke="#082545" strokeWidth="3" />
            <text
              x={x}
              y={lineY + 26}
              textAnchor="middle"
              fontSize="13"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="800"
              fill="#082545"
            >
              {w}
            </text>
          </g>
        );
      })}
      {fractions.map((f, idx) => {
        const val = Math.max(0, Math.min(maxWhole, f.num / Math.max(1, f.den)));
        const x = startX + (val / maxWhole) * spanW;
        const isTop = idx % 2 === 0;
        const baseY = isTop ? lineY - 28 : lineY + 28;
        return (
          <g key={`${f.label}-${idx}`}>
            <circle
              cx={x}
              cy={lineY}
              r="7.5"
              fill={f.color}
              stroke="#082545"
              strokeWidth="2.2"
            />
            {/* Render proper vertical fraction on number line */}
            <text
              x={x}
              y={baseY - 4}
              textAnchor="middle"
              fontSize="11"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="800"
              fill={f.color}
            >
              {f.num}
            </text>
            <line
              x1={x - 8}
              y1={baseY}
              x2={x + 8}
              y2={baseY}
              stroke={f.color}
              strokeWidth="2"
            />
            <text
              x={x}
              y={baseY + 12}
              textAnchor="middle"
              fontSize="11"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="800"
              fill={f.color}
            >
              {f.den}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================================
// THREE 3D EDUCATIONAL GAME ICONS USING OFFICIAL UPLOADED ASSETS
// ============================================================================
export const GameIcon3D: React.FC<{
  gameType: 'tariktambang' | 'openbox' | 'bridgebuilder';
}> = ({ gameType }) => {
  if (gameType === 'tariktambang') {
    return (
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#BAE6FD] via-[#E0F2FE] to-[#FEF08A] border-[3px] border-[#082545] shadow-[0_4px_0_#082545] overflow-hidden flex items-center justify-between px-1.5 select-none">
        <img
          src="/assets/aistudio/latar_sungai_b1e99bf9.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <img
          src="/assets/aistudio/tt-biru-tarik_ee35d8e6.webp"
          alt="Tim Biru Tarik Tambang"
          className="relative z-10 w-1/2 h-4/5 object-contain drop-shadow"
        />
        <div className="absolute left-1/4 right-1/4 top-1/2 h-1.5 bg-[#D97706] border border-[#082545] z-0 rounded-full" />
        <img
          src="/assets/aistudio/tt-merah-tarik_eb97556a.webp"
          alt="Tim Merah Tarik Tambang"
          className="relative z-10 w-1/2 h-4/5 object-contain -scale-x-100 drop-shadow"
        />
      </div>
    );
  }

  if (gameType === 'openbox') {
    return (
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#EDE9FE] via-[#DDD6FE] to-[#FEF08A] border-[3px] border-[#082545] shadow-[0_4px_0_#082545] overflow-hidden flex items-center justify-center p-2 select-none">
        <img
          src="/assets/aistudio/kilau_bintang_0c99eac6.png"
          alt=""
          className="absolute inset-1 w-full h-full object-contain opacity-80"
        />
        <img
          src="/assets/aistudio/peti_harta_02e5e276.png"
          alt="Peti Harta Open Box"
          className="relative z-10 w-4/5 h-4/5 object-contain drop-shadow"
        />
        <img
          src="/assets/aistudio/permata_biru_d998724f.png"
          alt=""
          className="absolute top-1.5 right-1.5 w-7 h-7 object-contain z-20 drop-shadow"
        />
        <img
          src="/assets/aistudio/bintang_emas_e146828e.png"
          alt=""
          className="absolute bottom-1.5 left-1.5 w-7 h-7 object-contain z-20 drop-shadow"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#BAE6FD] to-[#BBF7D0] border-[3px] border-[#082545] shadow-[0_4px_0_#082545] overflow-hidden flex items-center justify-center p-1.5 select-none">
      <img
        src="/assets/aistudio/latar_sungai_b1e99bf9.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <img
        src="/assets/aistudio/jembatan_selesai_50c3af98.png"
        alt=""
        className="absolute bottom-2 left-2 right-2 w-[88%] mx-auto object-contain z-10"
      />
      <img
        src="/assets/aistudio/adit_builder_3d_31ebe636.webp"
        alt="Adit Builder 3D"
        className="relative z-20 w-3/5 h-4/5 object-contain drop-shadow"
      />
      <img
        src="/assets/aistudio/naya_builder_3d_9686708a.webp"
        alt="Naya Builder 3D"
        className="relative z-20 w-3/5 h-4/5 object-contain drop-shadow -ml-3"
      />
    </div>
  );
};

