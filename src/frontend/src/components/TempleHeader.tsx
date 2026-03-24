import { motion } from "motion/react";

interface TempleHeaderProps {
  subtitle?: string;
  compact?: boolean;
}

export function TempleHeader({ subtitle, compact = false }: TempleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center ${compact ? "py-6" : "py-12"}`}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-3xl">🕉️</span>
        <h1
          className={`font-display font-bold text-saffron-600 ${
            compact ? "text-3xl" : "text-5xl"
          }`}
        >
          Hosamma Temple
        </h1>
        <span className="text-3xl">🕉️</span>
      </div>
      {subtitle && (
        <p className="text-muted-foreground font-body text-lg mt-1">
          {subtitle}
        </p>
      )}
      <div className="flex justify-center mt-3">
        <div className="h-0.5 w-32 gold-shimmer rounded-full" />
      </div>
    </motion.div>
  );
}
