import { use } from "react";
import EditTeamPageClient from "./page-client";

export default function EditTeamPage({
  params,
}: {
  params: Promise<{ clubId: string; id: string }>;
}) {
  const { clubId, id } = use(params);
  return <EditTeamPageClient clubId={clubId} teamId={id} />;
}
