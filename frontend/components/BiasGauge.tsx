interface BiasGaugeProps {
  bias: number;
  size?: "small" | "large";
}

export default function BiasGauge({ bias, size = "small" }: BiasGaugeProps) {
  // Convert bias (0-100) to angle (-90 to 90 degrees)
  // 0 = against, 50 = unbiased, 100 = for
  const angle = (bias - 50) * 1.8; // -90 to 90 degrees

  const dimensions = size === "small" ? {
    width: 100,
    height: 55,
    strokeWidth: 8,
    needleLength: 28,
    radius: 38
  } : {
    width: 140,
    height: 75,
    strokeWidth: 10,
    needleLength: 42,
    radius: 52
  };

  const centerX = dimensions.width / 2;
  const centerY = dimensions.radius + 5;

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY - (radius * Math.sin(angleInRadians))
    };
  }

  // Create arc paths
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, dimensions.radius, startAngle);
    const end = polarToCartesian(centerX, centerY, dimensions.radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? "1" : "0";
    const sweepFlag = endAngle > startAngle ? "0" : "1";
    return `M ${start.x} ${start.y} A ${dimensions.radius} ${dimensions.radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
  };

  // Needle position - convert bias (0-100) to angle (0-180 degrees)
  const needleAngle = bias * 1.8;
  const needleEnd = polarToCartesian(centerX, centerY, dimensions.needleLength, needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* For arc (green) - left side */}
        <path
          d={createArc(180, 90)}
          fill="none"
          stroke="#86efac"
          strokeWidth={dimensions.strokeWidth}
          strokeLinecap="round"
        />

        {/* Against arc (red) - right side */}
        <path
          d={createArc(90, 0)}
          fill="none"
          stroke="#fca5a5"
          strokeWidth={dimensions.strokeWidth}
          strokeLinecap="round"
        />

        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#44403c"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r="3" fill="#44403c" />

        {/* Labels */}
        <text x="0" y={centerY + 15} className="fill-stone-400 text-[9px] font-light">FOR</text>
        <text x={dimensions.width - 28} y={centerY + 15} className="fill-stone-400 text-[9px] font-light">AGAINST</text>
      </svg>
    </div>
  );
}
