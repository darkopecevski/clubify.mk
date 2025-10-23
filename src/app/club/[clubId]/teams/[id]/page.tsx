import { use } from "react";
import TeamDetailPage from "./page-client";

export default function Page({
  params,
}: {
  params: Promise<{ clubId: string; id: string }>;
}) {
  const { clubId, id } = use(params);
  return <TeamDetailPage clubId={clubId} teamId={id} />;
}
