import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { MakeupFlow, type EligibleMissedSession } from "@/components/booking/MakeupFlow";
import type { EligibleSlot } from "@/components/booking/BookingFlow";
import { bookMakeupSession } from "@/lib/actions/booking-actions";

export default async function BookMakeupPage() {
  const session = await getSessionProfile();
  const familyId = session!.profile!.family_id!;
  const supabase = await createClient();

  const { data: hpStudents } = await supabase
    .from("students")
    .select("id")
    .eq("family_id", familyId)
    .eq("type", "hp");
  const hpStudentIds = (hpStudents ?? []).map((s) => s.id);

  const [{ data: missedSessions }, { data: slots }] = await Promise.all([
    hpStudentIds.length
      ? supabase
          .from("missed_sessions")
          .select("id, occurred_at, student_id, students(id, name, type)")
          .in("student_id", hpStudentIds)
          .eq("notice_given", true)
          .is("makeup_booking_id", null)
          .order("occurred_at", { ascending: false })
      : Promise.resolve({ data: [] as EligibleMissedSession[] }),
    supabase
      .from("slot_instances")
      .select(
        "id, starts_at, ends_at, eligibility_type, coaches(name), slot_instance_students(student_id)"
      )
      .eq("status", "open")
      .gt("starts_at", new Date().toISOString())
      .in("eligibility_type", ["open_all", "hp_only", "named_only"])
      .order("starts_at")
      .limit(200),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Book a Makeup Session</h1>
        <p className="text-sm text-gray-500">
          Only sessions logged as an excused (advance-notice) absence are eligible for a makeup.
        </p>
      </div>
      <MakeupFlow
        missedSessions={(missedSessions as unknown as EligibleMissedSession[]) ?? []}
        slots={(slots as unknown as EligibleSlot[]) ?? []}
        onBook={bookMakeupSession}
      />
    </div>
  );
}
