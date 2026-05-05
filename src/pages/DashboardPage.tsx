import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  WeeklyReportsChart,
  IncidentTypePieChart,
  MonthlyTrendChart,
  RegionBreakdownChart,
} from "@/components/dashboard/Charts";
import { IncidentMap } from "@/components/map/IncidentMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockReports } from "@/data/mockData";
import { IncidentBadge } from "@/components/ui/incident-badge";
import { SeverityIndicator } from "@/components/ui/severity-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Report } from "@/types";
import { formatTimeAgo } from "@/utils/formatDate";

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);

  const getReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    //console.log(data);

    setReports(data);
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of environmental incidents across Nigeria
          </p>
        </motion.div>

        {}
        <section className="mb-8">
          <StatsCards reports={reports} />
        </section>

        {}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Live Incident Map</CardTitle>
                <Link to="/map">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Full Map
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full h-[400px]">
                <IncidentMap
                  reports={reports}
                  height="100%"
                  className="rounded-none rounded-b-xl"
                  showFilters={false}
                  showLegend={false}
                />
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Reports</CardTitle>
                {/* <Link to="/reports">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight size={16} />
                  </Button>
                </Link> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <IncidentBadge type={report.incident_type} size="sm" />
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-sm font-medium line-clamp-2 mb-2">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {report.location_name.split(",")[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(report.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WeeklyReportsChart reports={reports} />
          <IncidentTypePieChart reports={reports} />
          <RegionBreakdownChart reports={reports} />
          <MonthlyTrendChart reports={reports} />
        </div>
      </div>
    </DashboardLayout>
  );
}
