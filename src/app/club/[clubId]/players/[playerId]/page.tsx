import { use } from "react";
import PlayerProfilePage from "./page-client";

export default function Page({
  params,
}: {
  params: Promise<{ clubId: string; playerId: string }>;
}) {
  const { clubId, playerId } = use(params);
  return <PlayerProfilePage clubId={clubId} playerId={playerId} />;
}
