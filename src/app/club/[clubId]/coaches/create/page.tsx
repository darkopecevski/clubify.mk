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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Coach</h1>
        <p className="text-muted-foreground mt-1">
          Create a new coach account and profile
        </p>
      </div>

      <CreateCoachForm clubId={clubId} />
    </div>
  );
}
