import { use } from "react";
import ClubDashboardPage from "./page-client";

export default function Page({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <ClubDashboardPage clubId={clubId} />;
}
