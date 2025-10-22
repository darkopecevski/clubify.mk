import { createClient } from "@/lib/supabase/server";
import ClubsTable from "./clubs-table";

async function getClubs() {
  const supabase = await createClient();

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }

  return clubs || [];
}

export default async function ClubsPage() {
  const clubs = await getClubs();

  return <ClubsTable clubs={clubs} />;
}
