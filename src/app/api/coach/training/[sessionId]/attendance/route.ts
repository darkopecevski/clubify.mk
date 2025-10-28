import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/coach/training/[sessionId]/attendance - Get attendance for a session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Get training session with team info
    const { data: session } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        team_id,
        session_date,
        start_time,
        teams:team_id (
          id,
          name,
          club_id
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Training session not found" },
        { status: 404 }
      );
    }

    const clubId = (session.teams as { club_id: string }).club_id;

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
      // Check if coach is assigned to this team
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
          .eq("team_id", session.team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this training session" },
        { status: 403 }
      );
    }

    // Get all players in the team
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
      .eq("team_id", session.team_id)
      .eq("is_active", true);

    // Get attendance records for this session
    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select("*")
      .eq("training_session_id", sessionId);

    // Combine player info with attendance status
    const attendance = teamPlayers?.map((tp) => {
      const player = tp.players as {
        id: string;
        first_name: string;
        last_name: string;
        jersey_number: number | null;
      };
      const record = attendanceRecords?.find((a) => a.player_id === player.id);

      return {
        player_id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number,
        status: record?.status || null,
        arrival_time: record?.arrival_time || null,
        notes: record?.notes || null,
      };
    });

    return NextResponse.json({
      session,
      attendance: attendance || [],
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);

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

// POST /api/coach/training/[sessionId]/attendance - Save attendance for session
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
    const { attendance } = body as {
      attendance: Array<{
        player_id: string;
        status: string;
        arrival_time?: string;
        notes?: string;
      }>;
    };

    if (!attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Attendance records are required" },
        { status: 400 }
      );
    }

    // Get training session with team info
    const { data: session } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        team_id,
        teams:team_id (
          id,
          club_id
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Training session not found" },
        { status: 404 }
      );
    }

    const clubId = (session.teams as { club_id: string }).club_id;

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
      // Check if coach is assigned to this team
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
          .eq("team_id", session.team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this training session" },
        { status: 403 }
      );
    }

    // Upsert attendance records
    const attendanceRecords = attendance
      .filter((a) => a.status) // Only save records with a status
      .map((a) => ({
        training_session_id: sessionId,
        player_id: a.player_id,
        status: a.status,
        arrival_time: a.arrival_time || null,
        notes: a.notes || null,
      }));

    if (attendanceRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from("attendance")
        .upsert(attendanceRecords, {
          onConflict: "training_session_id,player_id",
        });

      if (upsertError) {
        console.error("Attendance upsert error:", upsertError);
        throw new Error(`Failed to save attendance: ${upsertError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
      recordsSaved: attendanceRecords.length,
    });
  } catch (error) {
    console.error("Error saving attendance:", error);

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
