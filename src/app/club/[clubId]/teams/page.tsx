import { use } from "react";
import TeamsPageClient from "./page-client";

export default function TeamsPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  return <TeamsPageClient clubId={clubId} />;
}
