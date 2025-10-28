import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/coach/attendance/statistics - Get attendance statistics
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

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

    // Build query for teams accessible by this coach
    let teamsQuery = supabase.from("teams").select("id, name, club_id");

    if (!isSuperAdmin) {
      // Get club IDs the user has access to
      const clubIds = roles
        .filter((r) => r.role === "club_admin" && r.club_id)
        .map((r) => r.club_id)
        .filter((id): id is string => id !== null);

      if (clubIds.length > 0) {
        teamsQuery = teamsQuery.in("club_id", clubIds);
      } else if (roles.some((r) => r.role === "coach")) {
        // Get teams assigned to this coach
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

          const teamIds = assignments?.map((a) => a.team_id) || [];
          if (teamIds.length > 0) {
            teamsQuery = teamsQuery.in("id", teamIds);
          } else {
            // Coach has no teams, return empty
            return NextResponse.json({
              teams: [],
              statistics: [],
              overall: {
                totalSessions: 0,
                averageAttendance: 0,
                perfectAttendance: 0,
                lowAttendance: 0,
              },
            });
          }
        }
      }
    }

    // Apply team filter if provided
    if (teamId) {
      teamsQuery = teamsQuery.eq("id", teamId);
    }

    const { data: teams } = await teamsQuery;

    if (!teams || teams.length === 0) {
      return NextResponse.json({
        teams: [],
        statistics: [],
        overall: {
          totalSessions: 0,
          averageAttendance: 0,
          perfectAttendance: 0,
          lowAttendance: 0,
        },
      });
    }

    const teamIds = teams.map((t) => t.id);

    // Build sessions query with date filters
    let sessionsQuery = supabase
      .from("training_sessions")
      .select("id, team_id, session_date")
      .in("team_id", teamIds);

    if (dateFrom) {
      sessionsQuery = sessionsQuery.gte("session_date", dateFrom);
    }
    if (dateTo) {
      sessionsQuery = sessionsQuery.lte("session_date", dateTo);
    }

    const { data: sessions } = await sessionsQuery;

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        teams,
        statistics: [],
        overall: {
          totalSessions: 0,
          averageAttendance: 0,
          perfectAttendance: 0,
          lowAttendance: 0,
        },
      });
    }

    const sessionIds = sessions.map((s) => s.id);

    // Get all attendance records for these sessions
    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select(
        `
        id,
        training_session_id,
        player_id,
        status,
        players:player_id (
          id,
          first_name,
          last_name,
          jersey_number
        )
      `
      )
      .in("training_session_id", sessionIds);

    // Calculate statistics per player
    const playerStats = new Map<
      string,
      {
        player_id: string;
        first_name: string;
        last_name: string;
        jersey_number: number | null;
        total: number;
        present: number;
        late: number;
        absent: number;
        excused: number;
        injured: number;
        percentage: number;
      }
    >();

    // Get all players from teams
    const { data: teamPlayers } = await supabase
      .from("team_players")
      .select(
        `
        player_id,
        players:player_id (
          id,
          first_name,
          last_name,
          jersey_number
        )
      `
      )
      .in("team_id", teamIds)
      .eq("is_active", true);

    // Initialize stats for all players
    teamPlayers?.forEach((tp) => {
      const player = tp.players as {
        id: string;
        first_name: string;
        last_name: string;
        jersey_number: number | null;
      };
      playerStats.set(player.id, {
        player_id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number,
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        injured: 0,
        percentage: 0,
      });
    });

    // Count attendance by status
    attendanceRecords?.forEach((record) => {
      const player = record.players as {
        id: string;
        first_name: string;
        last_name: string;
        jersey_number: number | null;
      };

      if (!playerStats.has(player.id)) {
        playerStats.set(player.id, {
          player_id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          jersey_number: player.jersey_number,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          injured: 0,
          percentage: 0,
        });
      }

      const stats = playerStats.get(player.id)!;
      stats.total++;

      switch (record.status) {
        case "present":
          stats.present++;
          break;
        case "late":
          stats.late++;
          break;
        case "absent":
          stats.absent++;
          break;
        case "excused":
          stats.excused++;
          break;
        case "injured":
          stats.injured++;
          break;
      }

      // Calculate percentage: (present + late) / total
      if (stats.total > 0) {
        stats.percentage = Math.round(
          ((stats.present + stats.late) / stats.total) * 100
        );
      }
    });

    const statistics = Array.from(playerStats.values()).sort((a, b) => {
      // Sort by percentage descending
      return b.percentage - a.percentage;
    });

    // Calculate overall statistics
    const totalSessions = sessions.length;
    const totalAttendanceRecords = attendanceRecords?.length || 0;
    const averageAttendance =
      totalSessions > 0
        ? Math.round((totalAttendanceRecords / (totalSessions * (teamPlayers?.length || 1))) * 100)
        : 0;
    const perfectAttendance = statistics.filter(
      (s) => s.percentage === 100 && s.total > 0
    ).length;
    const lowAttendance = statistics.filter(
      (s) => s.percentage < 75 && s.total > 0
    ).length;

    return NextResponse.json({
      teams,
      statistics,
      overall: {
        totalSessions,
        averageAttendance,
        perfectAttendance,
        lowAttendance,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);

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
