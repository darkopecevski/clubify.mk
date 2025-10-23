import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateCoachForm from "./create-coach-form";

export default async function CreateCoachPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <CreateCoachForm clubId={clubId} />
    </div>
  );
}
