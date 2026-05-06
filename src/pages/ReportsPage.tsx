import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsTable } from "@/components/reports/ReportsTable";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Manage and verify environmental incident reports
          </p>
        </motion.div>

        <ReportsTable />
      </div>
    </DashboardLayout>
  );
}
