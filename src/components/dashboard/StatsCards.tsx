import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
} from "lucide-react";
import { mockDashboardStats } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Report } from "@/types";

interface StatsCardsProps {
  reports: Report[];
}

export const StatsCards = ({ reports }: StatsCardsProps) => {
  console.log(reports);
  const statCards = [
    {
      title: "Total Reports",
      value: reports.length,
      change: mockDashboardStats.reportsChange,
      icon: FileText,
      color: "primary",
    },
    {
      title: "Pending Review",
      value: reports.filter((r) => r.status === "pending").length,
      subtitle: "Awaiting verification",
      icon: Clock,
      color: "warning",
    },
    {
      title: "Verified Reports",
      value: reports.filter((r) => r.status === "verified").length,
      subtitle: "88% verification rate",
      icon: CheckCircle2,
      color: "success",
    },
    {
      title: "Active Alerts",
      value: mockDashboardStats.activeAlerts,
      subtitle: "Across 3 regions",
      icon: AlertTriangle,
      color: "destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    stat.color === "primary" && "bg-primary/10 text-primary",
                    stat.color === "warning" && "bg-warning/10 text-warning",
                    stat.color === "success" && "bg-success/10 text-success",
                    stat.color === "destructive" &&
                      "bg-destructive/10 text-destructive",
                  )}
                >
                  <stat.icon size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                {stat.change !== undefined && (
                  <span
                    className={cn(
                      "flex items-center text-sm font-medium",
                      stat.change > 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {stat.change > 0 ? (
                      <TrendingUp size={16} className="mr-0.5" />
                    ) : (
                      <TrendingDown size={16} className="mr-0.5" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
              {stat.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
