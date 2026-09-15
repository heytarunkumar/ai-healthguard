interface RiskGaugeProps {
 score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
 const clampedScore = Math.max(0, Math.min(100, score));
 const angle = (clampedScore / 100) * 180 - 90; // -90 to 90 degrees

 const getColor = () => {
 if (clampedScore <= 39) return "hsl(var(--risk-low, 142 76% 36%))";
 if (clampedScore <= 69) return "hsl(var(--risk-moderate, 38 92% 50%))";
 return "hsl(var(--risk-high, 0 84% 60%))";
 };

 const getLabel = () => {
 if (clampedScore <= 39) return "LOW RISK";
 if (clampedScore <= 69) return "MODERATE RISK";
 return "HIGH RISK";
 };

 const getLabelColor = () => {
 if (clampedScore <= 39) return "text-emerald-600 dark:text-emerald-400";
 if (clampedScore <= 69) return "text-amber-600 dark:text-amber-400";
 return "text-red-600 dark:text-red-400";
 };

 const radius = 100;
 const strokeWidth = 14;
 const center = 120;

 const createArc = (startAngle: number, endAngle: number) => {
 const startRad = (startAngle * Math.PI) / 180;
 const endRad = (endAngle * Math.PI) / 180;
 const x1 = center + radius * Math.cos(startRad);
 const y1 = center + radius * Math.sin(startRad);
 const x2 = center + radius * Math.cos(endRad);
 const y2 = center + radius * Math.sin(endRad);
 const largeArc = endAngle - startAngle > 180 ? 1 : 0;
 return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
 };

 const filledAngle = 180 + (clampedScore / 100) * 180;

 return (
 <div className="flex flex-col items-center">
 <svg viewBox="0 0 240 150" className="w-64">
 {/* Background arc */}
 <path
 d={createArc(180, 360)}
 fill="none"
 stroke="hsl(var(--muted))"
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 />
 {/* Green segment */}
 <path
 d={createArc(180, 180 + 72)}
 fill="none"
 stroke="hsl(var(--risk-low) / 0.3)"
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 />
 {/* Amber segment */}
 <path
 d={createArc(252, 252 + 54)}
 fill="none"
 stroke="hsl(var(--risk-moderate) / 0.3)"
 strokeWidth={strokeWidth}
 />
 {/* Red segment */}
 <path
 d={createArc(306, 360)}
 fill="none"
 stroke="hsl(var(--risk-high) / 0.3)"
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 />
 {/* Filled arc */}
 {clampedScore > 0 && (
 <path
 d={createArc(180, Math.min(filledAngle, 360))}
 fill="none"
 stroke={getColor()}
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 className="transition-all duration-1000"
 />
 )}
 {/* Needle */}
 <line
 x1={center}
 y1={center}
 x2={center + 70 * Math.cos(((180 + (clampedScore / 100) * 180) * Math.PI) / 180)}
 y2={center + 70 * Math.sin(((180 + (clampedScore / 100) * 180) * Math.PI) / 180)}
 stroke={getColor()}
 strokeWidth="3"
 strokeLinecap="round"
 className="transition-all duration-1000"
 />
 <circle cx={center} cy={center} r="6" fill={getColor()} className="transition-all duration-1000" />

 {/* Score text */}
 <text x={center} y={center - 20} textAnchor="middle" className="fill-foreground text-3xl font-bold" style={{ fontSize: 36 }}>
 {clampedScore}
 </text>
 <text x={center} y={center - 4} textAnchor="middle" className="fill-muted-foreground text-xs" style={{ fontSize: 11 }}>
 / 100
 </text>
 </svg>
 <div className={`-mt-2 text-lg font-bold tracking-wider ${getLabelColor()}`}>
 {getLabel()}
 </div>
 </div>
 );
}
