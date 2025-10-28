import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/coach/training/recurring - Create recurring training pattern and generate sessions
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
      team_id,
      days_of_week,
      start_time,
      duration_minutes,
      location,
      notes,
      generate_until,
    } = body;

    // Validate required fields
    if (
      !team_id ||
      !days_of_week ||
      !Array.isArray(days_of_week) ||
      days_of_week.length === 0 ||
      !start_time ||
      !duration_minutes ||
      !generate_until
    ) {
      return NextResponse.json(
        {
          error:
            "Team, days of week, start time, duration, and generate until date are required",
        },
        { status: 400 }
      );
    }

    // Validate days_of_week values (0-6)
    if (!days_of_week.every((day: number) => day >= 0 && day <= 6)) {
      return NextResponse.json(
        { error: "Days of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration_minutes <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    // Get team to verify it exists and get club_id
    const { data: team } = await supabase
      .from("teams")
      .select(
        `
        id,
        club_id,
        clubs:club_id (
          id,
          name
        )
      `
      )
      .eq("id", team_id)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const clubId = team.club_id;

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
          .eq("team_id", team_id)
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

    // Create recurring patterns (one for each day of week)
    const recurrenceIds: string[] = [];

    for (const dayOfWeek of days_of_week) {
      const { data: recurrence, error: recurrenceError } = await supabase
        .from("training_recurrences")
        .insert({
          team_id,
          day_of_week: dayOfWeek,
          start_time,
          duration_minutes,
          location: location || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (recurrenceError) {
        console.error("Recurrence creation error:", recurrenceError);
        throw new Error(
          `Failed to create recurrence pattern: ${recurrenceError.message}`
        );
      }

      recurrenceIds.push(recurrence.id);
    }

    // Generate training sessions from today until generate_until date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(generate_until);
    endDate.setHours(23, 59, 59, 999);

    const sessionsToCreate = [];

    // Loop through each day from today to end date
    for (
      let date = new Date(today);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if this day matches any of our recurring patterns
      if (days_of_week.includes(dayOfWeek)) {
        // Format date manually to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const sessionDate = `${year}-${month}-${day}`;

        // Find the recurrence_id for this day of week
        const recurrenceIndex = days_of_week.indexOf(dayOfWeek);
        const recurrenceId = recurrenceIds[recurrenceIndex];

        sessionsToCreate.push({
          team_id,
          session_date: sessionDate,
          start_time,
          duration_minutes,
          location: location || null,
          notes: notes || null,
          recurrence_id: recurrenceId,
        });
      }
    }

    // Insert all sessions
    if (sessionsToCreate.length > 0) {
      const { error: sessionsError } = await supabase
        .from("training_sessions")
        .insert(sessionsToCreate);

      if (sessionsError) {
        console.error("Sessions creation error:", sessionsError);
        throw new Error(
          `Failed to create training sessions: ${sessionsError.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      patternsCreated: recurrenceIds.length,
      sessionsGenerated: sessionsToCreate.length,
      recurrenceIds,
    });
  } catch (error) {
    console.error("Error creating recurring training:", error);

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
