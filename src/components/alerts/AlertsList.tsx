import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IncidentBadge } from "@/components/ui/incident-badge";
import { SeverityIndicator } from "@/components/ui/severity-indicator";
import { mockAlerts } from "@/data/mockData";
import { format } from "date-fns";
import {
  Bell,
  Search,
  Plus,
  MapPin,
  Clock,
  Radio,
  MessageSquare,
  Smartphone,
  Mail,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert } from "@/types";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/utils/useAuthStore";

export function AlertsList() {
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const { user } = useAuthStore();

  const getAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    // console.log(data);

    setAlerts(data);
  };

  useEffect(() => {
    getAlerts();
  }, []);

  const endAlerts = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ active: false })
      .eq("id", alertId);

    if (error) {
      alert(error.message);
      //setIsLoading(false);
      return;
    }

    alert(`Alert ended successfully`);
    //setIsLoading(false);

    setTimeout(() => {
      getAlerts();
    }, 500);
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.area.toLowerCase().includes(search.toLowerCase()) ||
      alert.message.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Radio size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {alerts.filter((a) => a.active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
          </div>
        </Card>
        {/* <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">3.2K</p>
              <p className="text-sm text-muted-foreground">SMS Delivered</p>
            </div>
          </div>
        </Card> */}
      </div>

      {}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                alert.active && "border-l-4 border-l-destructive",
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <IncidentBadge type={alert.type} />
                        <SeverityIndicator level={alert.severity} size="sm" />
                        {alert.active ? (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/30"
                          >
                            <Radio size={10} className="mr-1.5 animate-pulse" />
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Ended</Badge>
                        )}
                      </div>
                      {user.email === "coflare@gmail.com" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem className="gap-2">
                            <Edit size={14} />
                            Edit Alert
                          </DropdownMenuItem> */}
                            {/* <DropdownMenuItem className="gap-2">
                            <Copy size={14} />
                            Duplicate
                          </DropdownMenuItem> */}
                            {alert.active && (
                              <DropdownMenuItem
                                onClick={() => endAlerts(alert.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 size={14} />
                                End
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <p className="font-medium">{alert.message}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {alert.area}
                      </span>
                      {/* <span className="flex items-center gap-1.5">
                        <Radio size={14} />
                        {alert.}km radius
                      </span> */}
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {format(alert.created_at, "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>

                  {/* <div className="flex sm:flex-col items-center gap-3 sm:gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4">
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">2.4K</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium">892</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">156</span>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const channels = [
    {
      id: "push",
      icon: Smartphone,
      title: "Push Notifications",
      description: "Instant alerts on your mobile device",
      enabled: pushEnabled,
      toggle: setPushEnabled,
    },
    {
      id: "sms",
      icon: MessageSquare,
      title: "SMS Alerts",
      description: "Text messages for critical incidents",
      enabled: smsEnabled,
      toggle: setSmsEnabled,
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Notifications",
      description: "Daily digest and important updates",
      enabled: emailEnabled,
      toggle: setEmailEnabled,
    },
    {
      id: "whatsapp",
      icon: MessageSquare,
      title: "WhatsApp Messages",
      description: "Alerts via WhatsApp for quick access",
      enabled: whatsappEnabled,
      toggle: setWhatsappEnabled,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} />
          Notification Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <channel.icon size={20} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{channel.title}</p>
                <p className="text-sm text-muted-foreground">
                  {channel.description}
                </p>
              </div>
            </div>
            <Switch
              checked={channel.enabled}
              onCheckedChange={channel.toggle}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
