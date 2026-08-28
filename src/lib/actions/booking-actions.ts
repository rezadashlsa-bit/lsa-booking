"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendBookingConfirmation } from "@/lib/email/send";
import type { ActionResult } from "./admin-actions";

async function performBooking(
  slotInstanceId: string,
  studentId: string,
  bookingType: "makeup" | "additional" | "open_hour",
  missedSessionId?: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: booking, error } = await supabase.rpc("book_slot", {
    p_slot_instance_id: slotInstanceId,
    p_student_id: studentId,
    p_booking_type: bookingType,
    p_missed_session_id: missedSessionId ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Best-effort: a failed confirmation email must never undo a successful booking.
  try {
    await sendBookingConfirmation(booking.id);
  } catch (e) {
    console.error("Failed to send booking confirmation email", e);
  }

  revalidatePath("/parent");
  revalidatePath("/parent/bookings");
  revalidatePath("/parent/book/makeup");
  revalidatePath("/parent/book/additional");
  revalidatePath("/parent/book/open");
  return { ok: true };
}

export async function bookMakeupSession(
  missedSessionId: string,
  studentId: string,
  slotInstanceId: string
): Promise<ActionResult> {
  return performBooking(slotInstanceId, studentId, "makeup", missedSessionId);
}

export async function bookAdditionalSession(
  studentId: string,
  slotInstanceId: string
): Promise<ActionResult> {
  return performBooking(slotInstanceId, studentId, "additional");
}

export async function bookOpenHourSession(
  studentId: string,
  slotInstanceId: string
): Promise<ActionResult> {
  return performBooking(slotInstanceId, studentId, "open_hour");
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/parent/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath("/coach/bookings");
  return { ok: true };
}
