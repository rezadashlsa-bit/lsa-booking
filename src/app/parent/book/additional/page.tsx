import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { BookingFlow, type EligibleSlot } from "@/components/booking/BookingFlow";
import { bookAdditionalSession } from "@/lib/actions/booking-actions";

export default async function BookAdditionalPage() {
  const session = await getSessionProfile();
  const familyId = session!.profile!.family_id!;
  const supabase = await createClient();

  const [{ data: students }, { data: slots }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, type")
      .eq("family_id", familyId)
      .eq("type", "hp")
      .eq("active", true),
    supabase
      .from("slot_instances")
      .select("id, starts_at, ends_at, eligibility_type, coaches(name), slot_instance_students(student_id)")
      .eq("status", "open")
      .gt("starts_at", new Date().toISOString())
      .in("eligibility_type", ["open_all", "hp_only", "named_only"])
      .order("starts_at")
      .limit(200),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Book an Additional Session</h1>
        <p className="text-sm text-gray-500">
          Extra sessions for HP/NCAA pathway students, coach and hour permitting.
        </p>
      </div>
      <BookingFlow
        students={students ?? []}
        slots={(slots as unknown as EligibleSlot[]) ?? []}
        onBook={bookAdditionalSession}
      />
    </div>
  );
}
