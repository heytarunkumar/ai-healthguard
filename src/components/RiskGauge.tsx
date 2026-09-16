import { motion } from "framer-motion";
import { useMemo } from "react";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function RiskGauge({ score, size = "md" }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Risk Band properties
  const { color, label, glowClass, gradientId } = useMemo(() => {
    if (clampedScore <= 39) {
      return {
        color: "#10b981", // Emerald
        label: "LOW RISK (0–39)",
        glowClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25 shadow-glow-emerald",
        gradientId: "gaugeGradLow",
      };
    }
    if (clampedScore <= 69) {
      return {
        color: "#f59e0b", // Amber
        label: "MODERATE RISK (40–69)",
        glowClass: "text-amber-500 bg-amber-500/10 border-amber-500/25 shadow-glow-amber",
        gradientId: "gaugeGradMod",
      };
    }
    return {
      color: "#ef4444", // Red
      label: "HIGH RISK (70–100)",
      glowClass: "text-red-500 bg-red-500/10 border-red-500/25 shadow-glow-red",
      gradientId: "gaugeGradHigh",
    };
  }, [clampedScore]);

  const radius = 90;
  const strokeWidth = 13;
  const centerX = 120;
  const centerY = 125;

  // Arc math (-180deg to 0deg in polar radians)
  const createArc = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Angle for the filled gauge arc (180deg to 360deg)
  const filledAngle = 180 + (clampedScore / 100) * 180;
  const needleAngle = (clampedScore / 100) * 180 - 90; // -90 to +90 degrees

  const sizeClass = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
  }[size];

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative ${sizeClass}`}>
        <svg viewBox="0 0 240 152" className="w-full overflow-visible drop-shadow-sm">
          <defs>
            <linearGradient id="gaugeGradLow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="gaugeGradMod" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <linearGradient id="gaugeGradHigh" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={createArc(180, 360)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment Guides */}
          {/* Low: 0 to 39% */}
          <path
            d={createArc(180, 180 + 39 * 1.8)}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeOpacity="0.22"
            strokeLinecap="round"
          />
          {/* Moderate: 40 to 69% */}
          <path
            d={createArc(180 + 40 * 1.8, 180 + 69 * 1.8)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeOpacity="0.22"
          />
          {/* High: 70 to 100% */}
          <path
            d={createArc(180 + 70 * 1.8, 360)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeOpacity="0.22"
            strokeLinecap="round"
          />

          {/* Active Filled Colored Arc */}
          {clampedScore > 0 && (
            <motion.path
              d={createArc(180, Math.min(filledAngle, 360))}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
            />
          )}

          {/* Numeric Scale Numbers outside arc */}
          <text x={24} y={142} className="fill-muted-foreground text-[10px] font-mono font-bold" textAnchor="middle">0</text>
          <text x={centerX} y={20} className="fill-muted-foreground text-[10px] font-mono font-bold" textAnchor="middle">50</text>
          <text x={216} y={142} className="fill-muted-foreground text-[10px] font-mono font-bold" textAnchor="middle">100</text>

          {/* Centered Score Readout (positioned with plenty of clearance above hub) */}
          <text
            x={centerX}
            y={80}
            textAnchor="middle"
            className="fill-foreground font-heading font-extrabold"
            style={{ fontSize: size === "lg" ? 38 : size === "sm" ? 28 : 34 }}
          >
            {clampedScore}
          </text>
          <text
            x={centerX}
            y={97}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono font-bold tracking-widest uppercase"
          >
            / 100 RISK SCORE
          </text>

          {/* Needle with Animation */}
          <g filter="url(#needleGlow)">
            <motion.g
              initial={{ rotate: -90 }}
              animate={{ rotate: needleAngle }}
              transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.05 }}
              style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
            >
              {/* Tapered Pointer */}
              <polygon
                points={`${centerX - 3},${centerY} ${centerX + 3},${centerY} ${centerX},${centerY - 64}`}
                fill={color}
              />
            </motion.g>
          </g>

          {/* Center Hub */}
          <circle cx={centerX} cy={centerY} r="8" fill="hsl(var(--card))" stroke={color} strokeWidth="2.5" />
          <circle cx={centerX} cy={centerY} r="3.5" fill={color} />
        </svg>
      </div>

      {/* Risk Band Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className={`mt-2 rounded-full px-4 py-1 text-xs font-heading font-extrabold tracking-wider border ${glowClass}`}
      >
        {label}
      </motion.div>
    </div>
  );
}
