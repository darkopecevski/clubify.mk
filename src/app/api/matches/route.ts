import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/matches - Fetch matches for coach or club admin
// Query params:
//   - team_id (optional) - filter by specific team
//   - club_id (optional) - filter by club (for club admins)
//   - status (optional) - filter by status (scheduled, completed, cancelled)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamIdFilter = searchParams.get("team_id");
    const clubIdFilter = searchParams.get("club_id");
    const statusFilter = searchParams.get("status");

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "club_admin", "coach"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some((r) => r.role === "club_admin");
    const isCoach = roles.some((r) => r.role === "coach");

    // Determine which teams the user has access to
    let accessibleTeamIds: string[] = [];

    if (isSuperAdmin) {
      // Super admin can see all matches
      // If club_id filter is provided, filter by that club
      if (clubIdFilter) {
        const { data: clubTeams } = await supabase
          .from("teams")
          .select("id")
          .eq("club_id", clubIdFilter);
        accessibleTeamIds = clubTeams?.map((t) => t.id) || [];
      }
      // If no filter, we'll fetch all matches (no team filter)
    } else if (isClubAdmin) {
      // Club admin can see matches for teams in their clubs
      // If club_id filter is provided, use that specific club
      // Otherwise, use all clubs the admin has access to
      let clubIds: string[] = [];

      if (clubIdFilter) {
        // Verify the admin has access to this club
        const hasAccess = roles.some(
          (r) => r.role === "club_admin" && r.club_id === clubIdFilter
        );
        if (hasAccess) {
          clubIds = [clubIdFilter];
        }
      } else {
        // No filter provided, use all clubs
        clubIds = roles
          .filter((r) => r.role === "club_admin" && r.club_id)
          .map((r) => r.club_id!);
      }

      if (clubIds.length > 0) {
        const { data: clubTeams } = await supabase
          .from("teams")
          .select("id")
          .in("club_id", clubIds);
        accessibleTeamIds = clubTeams?.map((t) => t.id) || [];
      }
    } else if (isCoach) {
      // Coach can only see matches for their assigned teams
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coach) {
        const { data: assignments } = await supabase
          .from("team_coaches")
          .select("team_id")
          .eq("coach_id", coach.id)
          .eq("is_active", true);

        accessibleTeamIds = assignments?.map((a) => a.team_id) || [];
      }
    }

    // Build query
    let matchesQuery = supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        away_team_id,
        away_team_name,
        match_date,
        start_time,
        location,
        competition,
        status,
        home_score,
        away_score,
        notes,
        created_at,
        teams:home_team_id (
          id,
          name,
          age_group,
          clubs:club_id (
            id,
            name
          )
        )
      `
      )
      .order("match_date", { ascending: false })
      .order("start_time", { ascending: false });

    // Apply team filter if specified
    if (teamIdFilter) {
      matchesQuery = matchesQuery.eq("home_team_id", teamIdFilter);
    } else if (accessibleTeamIds.length > 0) {
      // Filter by accessible teams
      matchesQuery = matchesQuery.in("home_team_id", accessibleTeamIds);
    } else if (!isSuperAdmin) {
      // If not super admin and no accessible teams, return empty
      return NextResponse.json({ matches: [] });
    }

    // Apply status filter if specified
    if (statusFilter) {
      matchesQuery = matchesQuery.eq("status", statusFilter);
    }

    const { data: matches, error: matchesError } = await matchesQuery;

    if (matchesError) {
      console.error("Matches fetch error:", matchesError);
      throw new Error(`Failed to fetch matches: ${matchesError.message}`);
    }

    return NextResponse.json({ matches: matches || [] });
  } catch (error) {
    console.error("Error fetching matches:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create a new match
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "club_admin", "coach"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      home_team_id,
      away_team_name,
      match_date,
      start_time,
      location,
      competition,
      notes,
    } = body;

    // Validate required fields
    if (!home_team_id || !away_team_name || !match_date || !start_time || !location) {
      return NextResponse.json(
        { error: "Team, opponent, date, time, and location are required" },
        { status: 400 }
      );
    }

    // Get team to verify access
    const { data: team } = await supabase
      .from("teams")
      .select("id, club_id")
      .eq("id", home_team_id)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === team.club_id
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coach) {
        const { data: assignment } = await supabase
          .from("team_coaches")
          .select("id")
          .eq("coach_id", coach.id)
          .eq("team_id", home_team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this team" },
        { status: 403 }
      );
    }

    // Create match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        home_team_id,
        away_team_name,
        match_date,
        start_time,
        location,
        competition: competition || null,
        notes: notes || null,
        status: "scheduled",
      })
      .select()
      .single();

    if (matchError) {
      console.error("Match creation error:", matchError);
      throw new Error(`Failed to create match: ${matchError.message}`);
    }

    return NextResponse.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("Error creating match:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
