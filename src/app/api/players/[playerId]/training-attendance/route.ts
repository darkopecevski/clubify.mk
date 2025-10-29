import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/players/[playerId]/training-attendance - Get player's training attendance statistics
export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all attendance records for this player
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from("attendance")
      .select(
        `
        id,
        status,
        arrival_time,
        notes,
        training_sessions:training_session_id (
          id,
          session_date,
          start_time,
          duration_minutes,
          location,
          teams:team_id (
            id,
            name,
            age_group
          )
        )
      `
      )
      .eq("player_id", playerId)
      .order("training_sessions(session_date)", { ascending: false });

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      return NextResponse.json(
        { error: "Failed to fetch attendance records" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Helper to filter by date range
    const filterByDateRange = (records: typeof attendanceRecords, startDate: Date) => {
      return records.filter((record) => {
        const sessionDate = new Date(record.training_sessions.session_date);
        return sessionDate >= startDate;
      });
    };

    const last30Days = filterByDateRange(attendanceRecords || [], thirtyDaysAgo);
    const last90Days = filterByDateRange(attendanceRecords || [], ninetyDaysAgo);
    const allTime = attendanceRecords || [];

    // Helper to calculate stats
    const calculateStats = (records: typeof attendanceRecords) => {
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const late = records.filter((r) => r.status === "late").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const excused = records.filter((r) => r.status === "excused").length;
      const injured = records.filter((r) => r.status === "injured").length;

      const attendanceCount = present + late;
      const attendancePercentage =
        total > 0 ? Math.round((attendanceCount / total) * 100) : 0;

      return {
        total,
        present,
        late,
        absent,
        excused,
        injured,
        attendancePercentage,
      };
    };

    const statistics = {
      last30Days: calculateStats(last30Days),
      last90Days: calculateStats(last90Days),
      allTime: calculateStats(allTime),
    };

    // Get recent attendance (last 10 sessions) and format them
    const recentAttendance = (attendanceRecords || []).slice(0, 10).map((record) => ({
      date: record.training_sessions.session_date,
      team: record.training_sessions.teams.name,
      status: record.status,
      arrivalTime: record.arrival_time,
      notes: record.notes,
    }));

    return NextResponse.json({
      statistics,
      recentAttendance,
    });
  } catch (error) {
    console.error("Error in training attendance route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
