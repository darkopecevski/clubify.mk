import { use } from "react";
import PlayerImportClient from "./page-client";

export default function PlayerImportPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <PlayerImportClient clubId={clubId} />;
}
