import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { Report } from "@/types";
import { incidentTypeConfig } from "@/types";
import { parseLocationName } from "./parselocationName";

const SEVERITY_LABELS: Record<number, string> = {
  5: "Critical",
  4: "Severe",
  3: "Significant",
  2: "Moderate",
  1: "Minor",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  verified: "Verified",
  rejected: "Rejected",
};

type ReportsExportProps = {
  /** Reports currently visible under the active filters/search */
  filteredReports: Report[];
  /** IDs of currently checked rows, if any */
  selectedReportIds?: string[];
};

export function ReportsExport({
  filteredReports,
  selectedReportIds = [],
}: ReportsExportProps) {
  const [alertedReportIds, setAlertedReportIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const getAlerts = async () => {
      const { data, error } = await supabase.from("alerts").select("report_id");

      if (error) {
        console.error(error.message);
        return;
      }

      setAlertedReportIds(
        new Set(data.map((a) => a.report_id).filter(Boolean)),
      );
    };

    getAlerts();
  }, []);

  const handleExport = () => {
    const rowsSource =
      selectedReportIds.length > 0
        ? filteredReports.filter((r) => selectedReportIds.includes(r.id))
        : filteredReports;

    const rows = rowsSource.map((report) => {
      //const { country, state } = parseLocationName(report.location_name);

      return {
        Location: report.location_name,
        "Report ID": report.id,
        Date: format(report.created_at, "yyyy-MM-dd"),
        Time: format(report.created_at, "HH:mm:ss"),
        Latitude: report.latitude,
        Longitude: report.longitude,
        "Incident Type":
          incidentTypeConfig[report.incident_type]?.label ||
          report.incident_type,
        Severity: SEVERITY_LABELS[report.severity] || report.severity,
        Status: STATUS_LABELS[report.status] || report.status,
        "Alerts Shared": alertedReportIds.has(report.id) ? "Yes" : "No",
        "Remarks by Reporter": report.description,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 14 }, // location
      // { wch: 18 }, // State/Province
      { wch: 20 }, // Report ID
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 16 }, // Incident Type
      { wch: 12 }, // Severity
      { wch: 16 }, // Status
      { wch: 12 }, // Alerts Shared
      { wch: 40 }, // Remarks
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
    XLSX.writeFile(workbook, `reports_export_${timestamp}.xlsx`);
  };

  return (
    <Button variant="outline" className="gap-2" onClick={handleExport}>
      <Download size={16} />
      Export
    </Button>
  );
}
