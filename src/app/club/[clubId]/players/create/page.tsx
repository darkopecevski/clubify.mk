import { use } from "react";
import CreatePlayerPageClient from "./page-client";

export default function CreatePlayerPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <CreatePlayerPageClient clubId={clubId} />;
}
