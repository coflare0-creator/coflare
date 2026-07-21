import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
  LayerGroup,
} from "react-leaflet";
import { LatLngExpression, Icon, DivIcon } from "leaflet";
import { mockReports, mockAlerts } from "@/data/mockData";
import { IncidentBadge } from "@/components/ui/incident-badge";
import { SeverityIndicator } from "@/components/ui/severity-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  MapPin,
  X,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IncidentType, Report, incidentTypeConfig } from "@/types";
import { format } from "date-fns";

const NIGERIA_CENTER: LatLngExpression = [9.082, 8.6753];

const INCIDENT_COLORS: Record<IncidentType, string> = {
  flood: "#0d6e8f",
  rain: "#7ec8e3",
  storm: "#7c5bb0",
  heat: "#e87f3e",
  waste: "#8b6914",
  pollution: "#9b59b6",
  "water-scarcity": "#e67e22",
  hazard: "#e74c3c",
};

function createIncidentIcon(type: IncidentType, severity: number) {
  return new DivIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full opacity-30 animate-ping" style="background-color: ${INCIDENT_COLORS[type]}"></div>
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg" style="background-color: ${INCIDENT_COLORS[type]}">
          ${severity}
        </div>
      </div>
    `,
    className: "custom-incident-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapControls() {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        },
        (err) => {
          console.warn("Geolocation failed or was denied:", err);
        },
      );
    }
  }, [map]);

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="h-10 w-10 bg-card text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn size={18} />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-10 w-10 bg-card text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut size={18} />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-10 w-10 bg-card text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              map.setView([pos.coords.latitude, pos.coords.longitude], 14);
            });
          }
        }}
      >
        <Locate size={18} />
      </Button>
    </div>
  );
}

function MapUpdater({ center }: { center: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        duration: 1.5,
      });
    }
  }, [center, map]);
  return null;
}

function AlertZones({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <LayerGroup>
      {mockAlerts
        .filter((a) => a.active)
        .map((alert) => (
          <CircleMarker
            key={alert.id}
            center={[alert.latitude, alert.longitude]}
            radius={alert.radius * 3}
            pathOptions={{
              color: "rgba(239, 68, 68, 0.5)",
              fillColor: "rgba(239, 68, 68, 0.2)",
              fillOpacity: 0.4,
              weight: 2,
            }}
          />
        ))}
    </LayerGroup>
  );
}

function IncidentMarkers({
  reports,
  onMarkerClick,
}: {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
}) {
  return (
    <LayerGroup>
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createIncidentIcon(report.incident_type, report.severity)}
          eventHandlers={{
            click: () => onMarkerClick(report),
          }}
        />
      ))}
    </LayerGroup>
  );
}

interface IncidentMapProps {
  reports?: Report[];
  className?: string;
  showFilters?: boolean;
  showLegend?: boolean;
  height?: string;
}

export function IncidentMap({
  reports,
  className,
  showFilters = true,
  showLegend = true,
  height = "600px",
}: IncidentMapProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [showAlertZones, setShowAlertZones] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState<LatLngExpression | null>(
    null,
  );

  interface Media {
    public_id: string;
    url: string;
    type: string;
  }

  const mediaFiles =
    selectedReport &&
    selectedReport.media &&
    selectedReport.media.map((item) => {
      const parsed = JSON.parse(item);

      return parsed.image;
    });

  //console.log(mediaFiles);

  useEffect(() => {
    const searchAddress = async () => {
      if (addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=5`,
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchAddress, 500);
    return () => clearTimeout(timeoutId);
  }, [addressQuery]);

  const filteredReports = reports.filter((report) => {
    if (filterType !== "all" && report.incident_type !== filterType)
      return false;
    if (
      filterSeverity !== "all" &&
      report.severity !== parseInt(filterSeverity)
    )
      return false;
    return true;
  });

  return (
    <div
      className={cn("relative rounded-xl overflow-hidden", className)}
      style={{ height }}
    >
      <MapContainer
        center={NIGERIA_CENTER}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControls />

        {}
        <AlertZones show={showAlertZones} />

        {}
        <IncidentMarkers
          reports={filteredReports}
          onMarkerClick={setSelectedReport}
        />
        <MapUpdater center={searchCenter} />
      </MapContainer>

      {}
      <Card className="absolute left-1/2 -translate-x-1/2 top-4 z-[1000] p-2 w-[90%] max-w-md bg-card/95 backdrop-blur-sm shadow-md">
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Search for a location..."
            className="pl-9 pr-10 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto z-[1001]">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-0 transition-colors"
                onClick={() => {
                  setAddressQuery(suggestion.display_name);
                  setSearchCenter([
                    parseFloat(suggestion.lat),
                    parseFloat(suggestion.lon),
                  ]);
                  setSuggestions([]);
                }}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}
      </Card>

      {}
      {}
      {showFilters && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-4 top-4 z-[1000] h-10 w-10 bg-card text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Filter size={18} />
          </Button>

          {filtersOpen && (
            <Card className="absolute left-4 top-16 z-[1000] p-4 w-64 bg-card/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  <span className="font-semibold">Filters</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 -mr-1 -mt-1"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Incident Type
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(incidentTypeConfig).map(
                        ([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Severity
                  </label>
                  <Select
                    value={filterSeverity}
                    onValueChange={setFilterSeverity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="5">Critical (5)</SelectItem>
                      <SelectItem value="4">Severe (4)</SelectItem>
                      <SelectItem value="3">Significant (3)</SelectItem>
                      <SelectItem value="2">Moderate (2)</SelectItem>
                      <SelectItem value="1">Minor (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="alerts"
                    checked={showAlertZones}
                    onCheckedChange={(c) => setShowAlertZones(c as boolean)}
                  />
                  <label htmlFor="alerts" className="text-sm cursor-pointer">
                    Show Alert Zones
                  </label>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {}
      {}
      {showLegend && (
        <Card className="absolute left-4 bottom-4 z-[1000] p-3 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Legend</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(incidentTypeConfig)
              .slice(0, 6)
              .map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: INCIDENT_COLORS[key as IncidentType],
                    }}
                  />
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {}
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
                        preload="none"
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt="uploaded media"
                        loading="lazy"
                        decoding="async"
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
    </div>
  );
}
