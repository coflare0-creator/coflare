import { cn } from "@/lib/utils";
import { SeverityLevel, severityLabels } from "@/types";

interface SeverityIndicatorProps {
  level: SeverityLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SeverityIndicator({
  level,
  showLabel = true,
  size = "md",
  className,
}: SeverityIndicatorProps) {
  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(`severity-${level} rounded-full`, sizeClasses[size])}
      />
      {showLabel && (
        <span className={cn("font-medium", textSizes[size])}>
          {severityLabels[level]}
        </span>
      )}
    </div>
  );
}

export function SeverityDots({
  level,
  className,
}: {
  level: SeverityLevel;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i <= level ? `severity-${level}` : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
