import { use } from "react";
import { ProtectedRoute } from "@/components/auth";
import TrainingDetailsClient from "./page-client";

export default function TrainingDetailsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  return (
    <ProtectedRoute requireMinimumRole="coach">
      <TrainingDetailsClient sessionId={sessionId} />
    </ProtectedRoute>
  );
}
