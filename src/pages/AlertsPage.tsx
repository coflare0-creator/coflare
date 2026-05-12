import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  AlertsList,
  NotificationSettings,
} from "@/components/alerts/AlertsList";

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Alerts</h1>
          <p className="text-muted-foreground">
            Manage emergency alerts and notification channels
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AlertsList />
          </div>
          {/* <div>
            <NotificationSettings />
          </div> */}
        </div>
      </div>
    </DashboardLayout>
  );
}
