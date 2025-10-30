import { ProtectedRoute } from "@/components/auth";
import SubscriptionFeesClient from "./page-client";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function SubscriptionFeesPage({ params }: Props) {
  const { clubId } = await params;

  return (
    <ProtectedRoute requireMinimumRole="club_admin" requireClubAccess={clubId}>
      <SubscriptionFeesClient clubId={clubId} />
    </ProtectedRoute>
  );
}
