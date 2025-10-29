import { ProtectedRoute } from "@/components/auth";
import PlayersPageClient from "./page-client";

export default function CoachPlayersPage() {
  return (
    <ProtectedRoute requireMinimumRole="coach">
      <PlayersPageClient />
    </ProtectedRoute>
  );
}
