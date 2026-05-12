import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { useAuthStore } from "@/utils/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyReportsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.id) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">My Reports</h1>
          <p className="text-muted-foreground">
            View and manage the environmental incidents you have reported
          </p>
        </motion.div>

        {}
        <ReportsTable user_id={user.id} />
      </div>
    </DashboardLayout>
  );
}
