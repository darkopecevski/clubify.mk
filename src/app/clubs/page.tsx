import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClubsPage() {
  const supabase = await createClient();

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading clubs: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Football Clubs</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs?.map((club) => (
          <Card key={club.id}>
            <CardHeader>
              <CardTitle>{club.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{club.description}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p>
                  <span className="font-medium">City:</span> {club.city}
                </p>
                {club.contact_email && (
                  <p>
                    <span className="font-medium">Email:</span> {club.contact_email}
                  </p>
                )}
                {club.contact_phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {club.contact_phone}
                  </p>
                )}
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {club.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs?.length === 0 && (
        <p className="text-center text-muted-foreground">No clubs found.</p>
      )}
    </div>
  );
}
