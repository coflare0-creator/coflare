export type IncidentType =
  | "flood"
  | "rain"
  | "storm"
  | "heat"
  | "waste"
  | "pollution"
  | "water-scarcity"
  | "hazard";

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export type ReportStatus = "pending" | "verified" | "rejected";

export type UserRole = "citizen" | "verifier" | "admin" | "organization";

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
  verified: boolean;
  avatar?: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  user_name?: string;
  incident_type: IncidentType;
  description: string;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  location_name: string;
  media: string[];
  water_depth?: "ankle" | "knee" | "waist" | "above";
  infrastructureImpact?: string[];
  status: ReportStatus;
  created_at: string;
  alert: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Alert {
  id: string;
  area: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: IncidentType;
  severity: SeverityLevel;
  message: string;
  created_at: Date;
  active: boolean;
}

export interface VerificationLog {
  id: string;
  reportId: string;
  verifiedBy: string;
  status: ReportStatus;
  notes: string;
  timestamp: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  activeAlerts: number;
  reportsByType: Record<IncidentType, number>;
  reportsThisWeek: number;
  reportsChange: number;
}

export const incidentTypeConfig: Record<
  IncidentType,
  { label: string; icon: string; color: string }
> = {
  flood: { label: "Flooding", icon: "Waves", color: "flood" },
  rain: { label: "Heavy Rainfall", icon: "CloudRain", color: "rain" },
  storm: { label: "Storm", icon: "CloudLightning", color: "storm" },
  heat: { label: "Heat Wave", icon: "Thermometer", color: "heat" },
  waste: { label: "Waste Dumping", icon: "Trash2", color: "waste" },
  pollution: { label: "Air Pollution", icon: "Wind", color: "pollution" },
  "water-scarcity": {
    label: "Water Scarcity",
    icon: "Droplets",
    color: "water-scarcity",
  },
  hazard: {
    label: "Environmental Hazard",
    icon: "AlertTriangle",
    color: "hazard",
  },
};

export const severityLabels: Record<SeverityLevel, string> = {
  1: "Minor",
  2: "Moderate",
  3: "Significant",
  4: "Severe",
  5: "Critical",
};
