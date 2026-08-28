"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendMissedSessionNotice } from "@/lib/email/send";
import type { ActionResult } from "./admin-actions";

export async function logMissedSession(
  bookingId: string,
  noticeGiven: boolean,
  reason?: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: missed, error } = await supabase.rpc("log_missed_session", {
    p_booking_id: bookingId,
    p_notice_given: noticeGiven,
    p_reason: reason ?? null,
  });

  if (error) return { ok: false, error: error.message };

  try {
    await sendMissedSessionNotice(missed.id);
  } catch (e) {
    console.error("Failed to send missed-session email", e);
  }

  revalidatePath("/coach/bookings");
  revalidatePath("/admin/missed-sessions");
  revalidatePath("/admin/bookings");
  revalidatePath("/parent/book/makeup");
  return { ok: true };
}

export async function markBookingComplete(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_booking_complete", { p_booking_id: bookingId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/coach/bookings");
  revalidatePath("/admin/bookings");
  return { ok: true };
}
