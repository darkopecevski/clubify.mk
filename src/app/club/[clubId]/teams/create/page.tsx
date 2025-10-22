import { use } from "react";
import CreateTeamPageClient from "./page-client";

export default function CreateTeamPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <CreateTeamPageClient clubId={clubId} />;
}
