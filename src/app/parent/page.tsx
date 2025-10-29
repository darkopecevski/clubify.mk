import { ProtectedRoute } from "@/components/auth";
import ParentDashboardClient from "./page-client";

export default function ParentDashboardPage() {
  return (
    <ProtectedRoute requireMinimumRole="parent">
      <ParentDashboardClient />
    </ProtectedRoute>
  );
}
