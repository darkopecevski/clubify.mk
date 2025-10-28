import { Metadata } from "next";
import MatchDetailsClient from "./page-client";

export const metadata: Metadata = {
  title: "Match Details - Club Admin",
  description: "View and manage match details",
};

export default function MatchDetailsPage() {
  return <MatchDetailsClient />;
}
