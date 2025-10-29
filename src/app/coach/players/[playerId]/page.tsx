import { use } from "react";
import { ProtectedRoute } from "@/components/auth";
import CoachPlayerProfilePage from "./page-client";

export default function Page({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);

  return (
    <ProtectedRoute requireMinimumRole="coach">
      <CoachPlayerProfilePage playerId={playerId} />
    </ProtectedRoute>
  );
}
