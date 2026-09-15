import { motion } from "framer-motion";

export function EcgWave({ className = "" }: { className?: string }) {
  // Classic P-Q-R-S-T cardiac waveform path
  const ecgPath = "M 0 50 L 50 50 L 65 50 L 75 42 L 85 50 L 95 50 L 105 58 L 115 15 L 125 85 L 135 45 L 145 50 L 160 50 L 175 38 L 195 50 L 250 50 L 300 50 L 315 50 L 325 42 L 335 50 L 345 50 L 355 58 L 365 15 L 375 85 L 385 45 L 395 50 L 410 50 L 425 38 L 445 50 L 500 50 L 550 50 L 565 50 L 575 42 L 585 50 L 595 50 L 605 58 L 615 15 L 625 85 L 635 45 L 645 50 L 660 50 L 675 38 L 695 50 L 750 50 L 800 50 L 815 50 L 825 42 L 835 50 L 845 50 L 855 58 L 865 15 L 875 85 L 885 45 L 895 50 L 910 50 L 925 38 L 945 50 L 1000 50";

  return (
    <div className={`relative w-full overflow-hidden pointer-events-none opacity-30 dark:opacity-20 ${className}`}>
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="w-full h-16 sm:h-24 stroke-primary"
        fill="none"
      >
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="25%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="75%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={ecgPath}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        <motion.path
          d={ecgPath}
          stroke="url(#ecgGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>
    </div>
  );
}
