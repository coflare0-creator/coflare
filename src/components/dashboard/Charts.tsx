import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { incidentTypeConfig, IncidentType } from "@/types";
import { Report } from "@/types";

interface ChartProps {
  reports: Report[];
}

// ================= COLORS =================
const incidentColors: Record<string, string> = {
  flood: "hsl(205, 85%, 50%)",
  rain: "hsl(210, 70%, 60%)",
  storm: "hsl(250, 60%, 55%)",
  heat: "hsl(25, 95%, 55%)",
  waste: "hsl(35, 50%, 40%)",
  pollution: "hsl(280, 40%, 50%)",
  "water-scarcity": "hsl(30, 85%, 50%)",
  hazard: "hsl(0, 70%, 50%)",
};

// ================= HELPERS =================

// Weekly data
const getWeeklyData = (reports: Report[]) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = Array(7).fill(0);

  reports.forEach((r) => {
    const day = new Date(r.created_at).getDay();
    counts[day]++;
  });

  return days.map((day, i) => ({
    day,
    reports: counts[i],
  }));
};

// Pie data
const getPieData = (reports: Report[]) => {
  const counts: Record<string, number> = {};

  reports.forEach((r) => {
    counts[r.incident_type] = (counts[r.incident_type] || 0) + 1;
  });

  return Object.entries(counts).map(([type, value]) => ({
    name: incidentTypeConfig[type as IncidentType]?.label || type,
    value,
    color: incidentColors[type] || "#888",
  }));
};

// Monthly trend
const getMonthlyData = (reports: Report[]) => {
  const months: Record<string, any> = {};

  reports.forEach((r) => {
    const date = new Date(r.created_at);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!months[key]) {
      months[key] = {
        month: key,
        flood: 0,
        rain: 0,
        storm: 0,
        other: 0,
      };
    }

    if (["flood", "rain", "storm"].includes(r.incident_type)) {
      months[key][r.incident_type]++;
    } else {
      months[key].other++;
    }
  });

  return Object.values(months);
};

// Region breakdown
const getRegionData = (reports: Report[]) => {
  const counts: Record<string, number> = {};

  reports.forEach((r) => {
    counts[r.location_name] = (counts[r.location_name] || 0) + 1;
  });

  const total = reports.length;

  return Object.entries(counts)
    .map(([region, count]) => ({
      region,
      reports: count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 5);
};

// ================= COMPONENTS =================

// Weekly Chart
export function WeeklyReportsChart({ reports }: ChartProps) {
  const data = getWeeklyData(reports);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="reports"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Pie Chart
export function IncidentTypePieChart({ reports }: ChartProps) {
  const data = getPieData(reports);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground truncate">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Monthly Trend
export function MonthlyTrendChart({ reports }: ChartProps) {
  const data = getMonthlyData(reports);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area
                dataKey="flood"
                stackId="1"
                stroke={incidentColors.flood}
                fill={incidentColors.flood}
                fillOpacity={0.6}
              />
              <Area
                dataKey="rain"
                stackId="1"
                stroke={incidentColors.rain}
                fill={incidentColors.rain}
                fillOpacity={0.6}
              />
              <Area
                dataKey="storm"
                stackId="1"
                stroke={incidentColors.storm}
                fill={incidentColors.storm}
                fillOpacity={0.6}
              />
              <Area
                dataKey="other"
                stackId="1"
                stroke="#999"
                fill="#ccc"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Region Breakdown
export function RegionBreakdownChart({ reports }: ChartProps) {
  const data = getRegionData(reports);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Regions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((region) => (
            <div key={region.region}>
              <div className="flex justify-between text-sm mb-1">
                <span>{region.region}</span>
                <span>
                  {region.reports} ({region.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
