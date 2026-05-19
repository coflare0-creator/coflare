import { Badge } from "@/components/ui/badge";
import { IncidentType, incidentTypeConfig } from "@/types";
import { cn } from "@/lib/utils";
import {
  Waves,
  CloudRain,
  CloudLightning,
  Thermometer,
  Trash2,
  Wind,
  Droplets,
  AlertTriangle,
} from "lucide-react";

const iconMap = {
  Waves,
  CloudRain,
  CloudLightning,
  Thermometer,
  Trash2,
  Wind,
  Droplets,
  AlertTriangle,
};

interface IncidentBadgeProps {
  type: IncidentType;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IncidentBadge({
  type,
  showIcon = true,
  size = "md",
  className,
}: IncidentBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const config = incidentTypeConfig[type];

  if (!config) {
    return (
      <Badge
        className={cn(
          sizeClasses[size],
          "font-medium gap-1.5 border-0",
          className,
        )}
      >
        {showIcon && <AlertTriangle size={iconSizes[size]} />}
        {type ?? "Unknown"}
      </Badge>
    );
  }

  const IconComponent = iconMap[config.icon as keyof typeof iconMap];

  return (
    <Badge
      className={cn(
        `incident-${type}`,
        sizeClasses[size],
        "font-medium gap-1.5 border-0",
        className,
      )}
    >
      {showIcon && IconComponent && <IconComponent size={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
