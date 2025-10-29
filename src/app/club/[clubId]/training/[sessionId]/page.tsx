import { Metadata } from "next";
import TrainingDetailsClient from "./page-client";

export const metadata: Metadata = {
  title: "Training Session Details - Club Admin",
  description: "View and manage training session details",
};

export default function TrainingDetailsPage() {
  return <TrainingDetailsClient />;
}
