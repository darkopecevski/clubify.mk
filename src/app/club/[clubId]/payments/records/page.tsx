import { ProtectedRoute } from "@/components/auth";
import PaymentRecordsClient from "./page-client";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function PaymentRecordsPage({ params }: Props) {
  const { clubId } = await params;

  return (
    <ProtectedRoute requireMinimumRole="club_admin" requireClubAccess={clubId}>
      <PaymentRecordsClient clubId={clubId} />
    </ProtectedRoute>
  );
}
