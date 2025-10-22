import { use } from "react";
import EditPlayerPage from "./page-client";

export default function Page({
  params,
}: {
  params: Promise<{ clubId: string; playerId: string }>;
}) {
  const { clubId, playerId } = use(params);
  return <EditPlayerPage clubId={clubId} playerId={playerId} />;
}
