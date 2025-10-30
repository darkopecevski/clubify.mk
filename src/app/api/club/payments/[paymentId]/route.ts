import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/club/payments/[paymentId] - Mark payment as paid
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { paymentId } = await params;
    const body = await request.json();
    const { amountPaid, paymentMethod, paymentDate, transactionReference, notes } =
      body;

    // Validation
    if (!amountPaid || amountPaid <= 0) {
      return NextResponse.json(
        { error: "Amount paid must be greater than 0" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        { error: "Payment date is required" },
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

    // Get payment record to verify club access
    const { data: payment } = await supabase
      .from("payment_records")
      .select(
        `
        *,
        team:team_id (
          club_id
        )
      `
      )
      .eq("id", paymentId)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this club
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === payment.team.club_id
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Club admin access required" },
        { status: 403 }
      );
    }

    // Calculate new status
    let newStatus: string;
    if (amountPaid >= payment.amount_due) {
      newStatus = "paid";
    } else if (amountPaid > 0) {
      newStatus = "partial";
    } else {
      newStatus = "unpaid";
    }

    // Update payment record
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payment_records")
      .update({
        amount_paid: amountPaid,
        status: newStatus,
        paid_date: paymentDate,
        payment_method: paymentMethod,
        transaction_reference: transactionReference || null,
        notes: notes || null,
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error("Error in /api/club/payments/[paymentId] PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
