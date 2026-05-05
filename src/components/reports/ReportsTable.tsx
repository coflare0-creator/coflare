import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IncidentBadge } from "@/components/ui/incident-badge";
import { SeverityDots } from "@/components/ui/severity-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockReports } from "@/data/mockData";
import { format } from "date-fns";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Flag,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { incidentTypeConfig } from "@/types";
import { supabase } from "@/utils/supabase";
import { Report } from "@/types";

export function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const updateReportStatus = async (reportId: string, status: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId);

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    alert(`Report ${status} successfully`);
    setIsLoading(false);

    setTimeout(() => {
      getReports();
    }, 500);
  };
  const [search, setSearch] = useState("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredReports = reports.filter((report) => {
    if (filterStatus !== "all" && report.status !== filterStatus) return false;
    if (filterType !== "all" && report.incident_type !== filterType)
      return false;
    if (
      search &&
      !report.location_name.toLowerCase().includes(search.toLowerCase()) &&
      !report.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const toggleReport = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
    }
  };

  return (
    <Card className="overflow-hidden">
      {}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(incidentTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {}
      {selectedReports.length > 0 && (
        <div className="px-4 py-2 bg-primary/5 border-b flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedReports.length} selected
          </span>
          <Button size="sm" variant="outline" className="gap-1.5 text-success">
            <CheckCircle2 size={14} />
            Verify
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive"
          >
            <XCircle size={14} />
            Reject
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Flag size={14} />
            Flag
          </Button>
        </div>
      )}

      {}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedReports.length === filteredReports.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group hover:bg-muted/50"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm line-clamp-1 max-w-xs">
                      {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.user_name || "Anonymous"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <IncidentBadge type={report.incident_type} size="sm" />
                </TableCell>
                <TableCell>
                  <SeverityDots level={report.severity} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm max-w-[200px]">
                    <MapPin
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="truncate">{report.location_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(report.created_at, "MMM d, h:mm a")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye size={14} />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <MapPin size={14} />
                        View on Map
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          updateReportStatus(report.id, "verified")
                        }
                        className="gap-2 text-success"
                      >
                        <CheckCircle2 size={14} />
                        Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateReportStatus(report.id, "rejected")
                        }
                        className="gap-2 text-destructive"
                      >
                        <XCircle size={14} />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {}
      <div className="p-4 border-t flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" className="min-w-8">
            1
          </Button>
          <Button variant="ghost" size="sm" className="min-w-8">
            2
          </Button>
          <Button variant="ghost" size="sm" className="min-w-8">
            3
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
