import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IncidentMap } from "@/components/map/IncidentMap";
import { supabase } from "@/utils/supabase";
import { useState, useEffect } from "react";
import { Report } from "@/types";

export default function MapPage() {
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

    console.log(data);

    setReports(data);
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <DashboardLayout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
        <IncidentMap reports={reports} height="100%" />
      </div>
    </DashboardLayout>
  );
}
