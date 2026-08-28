import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, FROM_EMAIL } from "./resend-client";
import { BookingConfirmationEmail } from "./templates/BookingConfirmation";
import { MissedSessionNoticeEmail } from "./templates/MissedSessionNotice";
import { formatJakarta } from "@/lib/time/timezone";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function recipientsForFamily(family: {
  primary_parent_email: string;
  secondary_parent_email: string | null;
}): string[] {
  return [family.primary_parent_email, family.secondary_parent_email].filter(
    (e): e is string => !!e
  );
}

async function logEmail(params: {
  type: string;
  recipient_email: string;
  related_booking_id?: string;
  related_missed_session_id?: string;
  resend_message_id?: string;
  status: "sent" | "failed";
  error?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("email_log").insert(params);
}

export async function sendBookingConfirmation(bookingId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, type, students(name, families(primary_parent_email, secondary_parent_email)), slot_instances(starts_at, coaches(name))"
    )
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    throw new Error(`Could not load booking ${bookingId} for confirmation email: ${error?.message}`);
  }

  type BookingJoin = {
    id: string;
    type: string;
    students: {
      name: string;
      families: { primary_parent_email: string; secondary_parent_email: string | null } | null;
    } | null;
    slot_instances: { starts_at: string; coaches: { name: string } | null } | null;
  };
  const b = booking as unknown as BookingJoin;

  const family = b.students?.families;
  if (!family) return;
  const recipients = recipientsForFamily(family);
  if (recipients.length === 0) return;

  const dateTimeLabel = formatJakarta(b.slot_instances?.starts_at ?? new Date());
  const coachName = b.slot_instances?.coaches?.name ?? "your coach";
  const studentName = b.students?.name ?? "Student";

  for (const recipient of recipients) {
    try {
      const { data } = await getResendClient().emails.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: `Booking confirmed: ${studentName} with ${coachName}`,
        react: BookingConfirmationEmail({
          studentName,
          coachName,
          dateTimeLabel,
          bookingType: b.type,
          manageUrl: `${SITE_URL}/parent/bookings`,
        }),
      });
      await logEmail({
        type: "booking_confirmation",
        recipient_email: recipient,
        related_booking_id: bookingId,
        resend_message_id: data?.id,
        status: "sent",
      });
    } catch (e) {
      await logEmail({
        type: "booking_confirmation",
        recipient_email: recipient,
        related_booking_id: bookingId,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

export async function sendMissedSessionNotice(missedSessionId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: missed, error } = await supabase
    .from("missed_sessions")
    .select(
      "id, occurred_at, notice_given, students(name, families(primary_parent_email, secondary_parent_email))"
    )
    .eq("id", missedSessionId)
    .single();

  if (error || !missed) {
    throw new Error(
      `Could not load missed session ${missedSessionId} for notice email: ${error?.message}`
    );
  }

  type MissedJoin = {
    id: string;
    occurred_at: string;
    notice_given: boolean;
    students: {
      name: string;
      families: { primary_parent_email: string; secondary_parent_email: string | null } | null;
    } | null;
  };
  const m = missed as unknown as MissedJoin;

  const family = m.students?.families;
  if (!family) return;
  const recipients = recipientsForFamily(family);
  if (recipients.length === 0) return;

  const dateTimeLabel = formatJakarta(m.occurred_at);
  const studentName = m.students?.name ?? "Student";

  for (const recipient of recipients) {
    try {
      const { data } = await getResendClient().emails.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: `Session update for ${studentName}`,
        react: MissedSessionNoticeEmail({
          studentName,
          dateTimeLabel,
          noticeGiven: m.notice_given,
          makeupUrl: `${SITE_URL}/parent/book/makeup`,
        }),
      });
      await logEmail({
        type: "missed_session",
        recipient_email: recipient,
        related_missed_session_id: missedSessionId,
        resend_message_id: data?.id,
        status: "sent",
      });
    } catch (e) {
      await logEmail({
        type: "missed_session",
        recipient_email: recipient,
        related_missed_session_id: missedSessionId,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
