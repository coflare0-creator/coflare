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
import {
  SeverityDots,
  SeverityIndicator,
} from "@/components/ui/severity-indicator";
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
  AlertCircleIcon,
  Clock,
  X,
} from "lucide-react";
import { IncidentType, incidentTypeConfig } from "@/types";
import { supabase } from "@/utils/supabase";
import { Report } from "@/types";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader, DialogOverlay } from "../ui/dialog";
import axios from "axios";
import { useAuthStore } from "@/utils/useAuthStore";
import { toast } from "sonner";
import { ReportsExport } from "@/utils/ReportsExport.tsx";

type ReportsTableProps = {
  user_id?: string | null;
};

export function ReportsTable({ user_id }: ReportsTableProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report>();

  const [alertData, setAlertData] = useState({
    message: "",
    radius: "",
    area: "",
  });

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / ITEMS_PER_PAGE),
  );

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterType]);

  // Clamp current page if filtered results shrink (e.g. after a status update)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const mediaFiles =
    selectedReport &&
    selectedReport.media &&
    selectedReport.media.map((item) => {
      const parsed = JSON.parse(item);

      return parsed.image;
    });

  const toggleReport = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    const pageIds = paginatedReports.map((r) => r.id);
    const allPageSelected = pageIds.every((id) => selectedReports.includes(id));

    if (allPageSelected) {
      setSelectedReports((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedReports((prev) => [
        ...prev,
        ...pageIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const PAGE_SIZE = 1000;

  const getReports = async () => {
    try {
      let allReports = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (user_id) {
          query = query.eq("user_id", user_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error(error.message);
          return;
        }

        allReports.push(...data);

        // Stop if we received fewer than PAGE_SIZE rows
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          from += PAGE_SIZE;
        }
      }

      setReports(allReports);
    } catch (error) {
      console.error(error);
    }
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
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success(`Report ${status} successfully`);
    setIsLoading(false);

    setTimeout(() => {
      getReports();
    }, 500);
  };

  const setAlert = async (
    report: Report,
    data: { message: string; radius: string; area: string },
  ) => {
    setIsLoading(true);

    try {
      // 1. Save alert to DB
      const { data: alertData, error } = await supabase
        .from("alerts")
        .insert({
          type: report.incident_type,
          severity: report.severity,
          message: data.message,
          area: data.area,
          radius: Number(data.radius),
        })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      // 2. Send SMS via backend
      const response = await axios.post(
        "https://coflare-backend-xdl5.onrender.com/api/alerts/send",
        {
          incident_type: report.incident_type,
          severity: report.severity,
          location_name: data.area,
          description: data.message,
        },
      );

      if (!response.data.success) {
        console.error(response.data);
        toast.warning("Alert saved but SMS failed");
      } else {
        toast.success("Alert sent successfully");
      }

      setTimeout(() => {
        navigate("/alerts");
      }, 500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build a small windowed list of page numbers around the current page
  const getPageNumbers = () => {
    const pages: number[] = [];
    const windowSize = 2;
    const start = Math.max(1, currentPage - windowSize);
    const end = Math.min(totalPages, currentPage + windowSize);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const firstPageNumber = pageNumbers[0];
  const lastPageNumber = pageNumbers[pageNumbers.length - 1];

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
              {incidentTypeConfig &&
                Object.entries(incidentTypeConfig).map(([key, config]) => {
                  if (!config) return null;

                  return (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          <ReportsExport
            filteredReports={filteredReports}
            selectedReportIds={selectedReports}
          />
        </div>
      </div>

      {}
      {selectedReports.length > 0 && user.email === "coflare0@gmail.com" && (
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
              {(user?.email === "coflare0@gmail.com" ||
                user?.email === "lekeham@gmail.com" ||
                user?.email === "obanishola122@gmail.com") && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedReports.length > 0 &&
                      paginatedReports.every((r) =>
                        selectedReports.includes(r.id),
                      )
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
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
            {paginatedReports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group hover:bg-muted/50"
              >
                {(user?.email === "coflare0@gmail.com" ||
                  user?.email === "lekeham@gmail.com" ||
                  user?.email === "obanishola122@gmail.com") && (
                  <TableCell>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={() => toggleReport(report.id)}
                    />
                  </TableCell>
                )}
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
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => {
                          setSelectedReport(report);
                        }}
                      >
                        <Eye size={14} />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <MapPin size={14} />
                        View on Map
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {(user?.email === "coflare0@gmail.com" ||
                        user?.email === "lekeham@gmail.com" ||
                        user?.email === "obanishola122@gmail.com") && (
                        <>
                          {" "}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setTimeout(() => {
                                setSelectedReport(report);
                                setAlertOpen(true);
                              }, 0);
                            }}
                            className="gap-2 text-destructive"
                          >
                            <AlertCircleIcon size={14} />
                            Alert
                          </DropdownMenuItem>{" "}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
        <DialogContent
          className="
    fixed left-1/2 top-1/2 z-50 w-full max-w-md 
    -translate-x-1/2 -translate-y-1/2
    animate-in fade-in zoom-in-95
    bg-white/10 dark:bg-black/30
    backdrop-blur-xl
    border border-white/20 dark:border-white/10
    shadow-2xl
    rounded-2xl p-6
  "
        >
          {" "}
          <DialogHeader>
            <DialogTitle>Send Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="w-full border rounded-md p-2 mt-1"
                value={alertData.message}
                onChange={(e) =>
                  setAlertData({ ...alertData, message: e.target.value })
                }
              />
            </div>

            {/* Radius */}
            <div>
              <label className="text-sm font-medium">Radius (km)</label>
              <input
                type="number"
                className="w-full border rounded-md p-2 mt-1"
                value={alertData.radius}
                onChange={(e) =>
                  setAlertData({ ...alertData, radius: e.target.value })
                }
              />
            </div>

            {/* Area */}
            <div>
              <label className="text-sm font-medium">Approximate Area</label>
              <input
                className="w-full border rounded-md p-2 mt-1"
                value={alertData.area}
                onChange={(e) =>
                  setAlertData({ ...alertData, area: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                if (!selectedReport) return;

                setAlert(selectedReport, alertData);

                setAlertOpen(false);

                setAlertData({
                  message: "",
                  radius: "",
                  area: "",
                });
              }}
            >
              Send Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <div className="p-4 border-t flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          {filteredReports.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1}
          –{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of{" "}
          {filteredReports.length} reports
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </Button>

          {getPageNumbers()[0] > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="min-w-8"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              {getPageNumbers()[0] > 2 && (
                <span className="text-sm text-muted-foreground px-1">…</span>
              )}
            </>
          )}

          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "outline" : "ghost"}
              size="sm"
              className="min-w-8"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>

            {firstPageNumber > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-8"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </Button>
                {firstPageNumber > 2 && (
                  <span className="text-sm text-muted-foreground px-1">…</span>
                )}
              </>
            )}

            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "outline" : "ghost"}
                size="sm"
                className="min-w-8"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            {lastPageNumber < totalPages && (
              <>
                {lastPageNumber < totalPages - 1 && (
                  <span className="text-sm text-muted-foreground px-1">…</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-8"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {selectedReport && (
        <Card className="absolute right-4 bottom-4 z-[1000] p-4 w-80 bg-card/95 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <IncidentBadge type={selectedReport.incident_type} />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 -mr-2 -mt-2"
              onClick={() => setSelectedReport(null)}
            >
              <X size={16} />
            </Button>
          </div>

          <h4 className="font-semibold mb-2 line-clamp-2">
            {selectedReport.location_name}
          </h4>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {selectedReport.description}
          </p>

          <div className="flex items-center gap-4 mb-3">
            <SeverityIndicator level={selectedReport.severity} size="sm" />
            <StatusBadge status={selectedReport.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock size={14} />
            {format(selectedReport.created_at, "MMM d, yyyy h:mm a")}
          </div>

          {mediaFiles && (
            <>
              <div className="font-semibold mb-2 line-clamp-2">Media</div>
              <div className="grid grid-cols-2 gap-4">
                {mediaFiles.map((media, index) => (
                  <div key={index}>
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt="uploaded media"
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
    </Card>
  );
}
