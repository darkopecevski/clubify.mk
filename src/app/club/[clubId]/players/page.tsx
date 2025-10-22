import { use } from "react";
import PlayersPageClient from "./page-client";

export default function PlayersPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <PlayersPageClient clubId={clubId} />;
}
