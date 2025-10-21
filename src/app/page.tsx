import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

async function getUserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user roles
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role, club_id")
    .eq("user_id", user.id);

  if (!roles || roles.length === 0) {
    return null;
  }

  // Check roles in hierarchy order
  const hasRole = (role: string) => roles.some(r => r.role === role);

  if (hasRole("super_admin")) return "/admin";
  if (hasRole("club_admin")) return "/club";
  if (hasRole("coach")) return "/coach";
  if (hasRole("parent")) return "/parent";
  if (hasRole("player")) return "/player";

  return null;
}

export default async function Home() {
  // Redirect authenticated users to their dashboard
  const dashboardUrl = await getUserDashboard();
  if (dashboardUrl) {
    redirect(dashboardUrl);
  }
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Clubify.mk</div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to{" "}
            <span className="text-primary">Clubify.mk</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Complete management system for Macedonian youth football clubs.
            Streamline training, matches, payments, and communication all in one place.
          </p>

          <div className="mt-10 flex gap-4">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Player Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive player profiles with medical info, emergency contacts, and performance tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Schedule sessions, track attendance, and notify parents automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track squads, lineups, results, and player statistics effortlessly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
