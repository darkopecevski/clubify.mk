import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/club/subscription-fees?clubId=xxx - Get teams with their subscription fees
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
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

    // Check if user has access to this club (super_admin or club_admin)
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

    // Get all teams for this club with their current subscription fee
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group
      `
      )
      .eq("club_id", clubId)
      .order("name");

    if (teamsError) throw teamsError;

    // Get player counts for each team
    const teamIds = teams?.map((t) => t.id) || [];
    const { data: playerCounts } = await supabase
      .from("team_players")
      .select("team_id")
      .in("team_id", teamIds)
      .is("left_at", null);

    // Count players per team
    const playerCountMap = new Map<string, number>();
    playerCounts?.forEach((pc) => {
      const count = playerCountMap.get(pc.team_id) || 0;
      playerCountMap.set(pc.team_id, count + 1);
    });

    // Get all subscription fees for each team
    // We'll select the most recent one per team (could be current or future)
    const { data: fees } = await supabase
      .from("subscription_fees")
      .select("*")
      .in("team_id", teamIds)
      .order("effective_from", { ascending: false });

    // Map fees to teams (take the most recent one per team)
    // This will show either the current fee or the next scheduled fee
    const feeMap = new Map<
      string,
      { id: string; amount: number; effective_from: string }
    >();
    fees?.forEach((fee) => {
      if (!feeMap.has(fee.team_id)) {
        feeMap.set(fee.team_id, {
          id: fee.id,
          amount: fee.amount,
          effective_from: fee.effective_from,
        });
      }
    });

    // Combine data
    const teamsWithFees = teams?.map((team) => ({
      id: team.id,
      name: team.name,
      age_group: team.age_group,
      player_count: playerCountMap.get(team.id) || 0,
      subscription_fee: feeMap.get(team.id) || null,
    }));

    return NextResponse.json({ teams: teamsWithFees });
  } catch (error) {
    console.error("Error in /api/club/subscription-fees GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/club/subscription-fees - Create new subscription fee
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { clubId, teamId, amount, effectiveFrom } = body;

    // Validation
    if (!clubId || !teamId || !amount || !effectiveFrom) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
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

    // Verify team belongs to club
    const { data: team } = await supabase
      .from("teams")
      .select("club_id")
      .eq("id", teamId)
      .single();

    if (!team || team.club_id !== clubId) {
      return NextResponse.json(
        { error: "Team does not belong to this club" },
        { status: 400 }
      );
    }

    // Insert new subscription fee
    const { data: newFee, error: insertError } = await supabase
      .from("subscription_fees")
      .insert({
        team_id: teamId,
        amount,
        effective_from: effectiveFrom,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ fee: newFee }, { status: 201 });
  } catch (error) {
    console.error("Error in /api/club/subscription-fees POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/club/subscription-fees - Update existing subscription fee
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { clubId, teamId, amount, effectiveFrom, feeId } = body;

    // Validation
    if (!clubId || !teamId || !amount || !effectiveFrom || !feeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
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

    // Verify team belongs to club
    const { data: team } = await supabase
      .from("teams")
      .select("club_id")
      .eq("id", teamId)
      .single();

    if (!team || team.club_id !== clubId) {
      return NextResponse.json(
        { error: "Team does not belong to this club" },
        { status: 400 }
      );
    }

    // Update subscription fee
    const { data: updatedFee, error: updateError } = await supabase
      .from("subscription_fees")
      .update({
        amount,
        effective_from: effectiveFrom,
      })
      .eq("id", feeId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ fee: updatedFee });
  } catch (error) {
    console.error("Error in /api/club/subscription-fees PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
