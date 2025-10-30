import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/club/payments/generate - Generate monthly payment records
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { clubId, month, year } = body;

    // Validation
    if (!clubId || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields: clubId, month, year" },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (year < 2024) {
      return NextResponse.json(
        { error: "Year must be 2024 or later" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this club
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Club admin access required" },
        { status: 403 }
      );
    }

    // Get all teams for this club
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("club_id", clubId);

    if (teamsError) throw teamsError;

    if (!teams || teams.length === 0) {
      return NextResponse.json(
        { error: "No teams found for this club" },
        { status: 400 }
      );
    }

    const teamIds = teams.map((t) => t.id);

    // Get active players for these teams
    const { data: teamPlayers, error: playersError } = await supabase
      .from("team_players")
      .select("team_id, player_id")
      .in("team_id", teamIds)
      .is("left_at", null);

    if (playersError) throw playersError;

    if (!teamPlayers || teamPlayers.length === 0) {
      return NextResponse.json(
        { error: "No active players found in this club" },
        { status: 400 }
      );
    }

    // Get subscription fees for all teams (most recent fee effective on or before target date)
    const targetDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const { data: fees } = await supabase
      .from("subscription_fees")
      .select("*")
      .in("team_id", teamIds)
      .lte("effective_from", targetDate)
      .order("effective_from", { ascending: false });

    // Map fees to teams (most recent fee per team)
    const feeMap = new Map<string, number>();
    fees?.forEach((fee) => {
      if (!feeMap.has(fee.team_id)) {
        feeMap.set(fee.team_id, fee.amount);
      }
    });

    // Calculate due date (5th of the month)
    const dueDate = new Date(year, month - 1, 5).toISOString().split("T")[0];

    // Prepare payment records to upsert
    const paymentRecords = [];
    const teamsWithoutFees = new Set<string>();

    for (const tp of teamPlayers) {
      // Get fee for this team
      const fee = feeMap.get(tp.team_id);
      if (!fee) {
        teamsWithoutFees.add(tp.team_id);
        continue;
      }

      // For now, discount is 0 (Phase 8.2 will add discount logic)
      const discountAmount = 0;
      const amountDue = fee - discountAmount;

      paymentRecords.push({
        player_id: tp.player_id,
        team_id: tp.team_id,
        period_month: month,
        period_year: year,
        amount_due: amountDue,
        amount_paid: 0,
        discount_applied: discountAmount,
        status: "unpaid",
        due_date: dueDate,
      });
    }

    // Upsert payment records (ignore duplicates)
    let insertedCount = 0;
    let skippedCount = 0;

    if (paymentRecords.length > 0) {
      // Use upsert with ignoreDuplicates to skip existing records
      const { data: upsertedData, error: upsertError } = await supabase
        .from("payment_records")
        .upsert(paymentRecords, {
          onConflict: "player_id,period_month,period_year",
          ignoreDuplicates: true,
        })
        .select();

      if (upsertError) {
        console.error("Upsert error details:", upsertError);
        throw upsertError;
      }

      insertedCount = upsertedData?.length || 0;
      skippedCount = paymentRecords.length - insertedCount;
    }

    // Get team names for teams without fees
    let teamsWithoutFeesNames: string[] = [];
    if (teamsWithoutFees.size > 0) {
      const { data: teamData } = await supabase
        .from("teams")
        .select("name")
        .in("id", Array.from(teamsWithoutFees));

      teamsWithoutFeesNames = teamData?.map((t) => t.name) || [];
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      skipped: skippedCount,
      teamsWithoutFees: teamsWithoutFeesNames,
      message: `Generated ${insertedCount} payment records. Skipped ${skippedCount} existing records.`,
    });
  } catch (error) {
    console.error("Error in /api/club/payments/generate:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
