import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { Card } from "@/components/ui/Card";
import { TemplateForm } from "@/components/availability/TemplateForm";
import { SlotList, type SlotRow } from "@/components/availability/SlotList";

export default async function CoachAvailabilityPage() {
  const session = await getSessionProfile();
  const coachId = session!.profile!.coach_id!;
  const supabase = await createClient();

  const [{ data: students }, { data: slots }] = await Promise.all([
    supabase.from("students").select("id, name, type").eq("active", true).order("name"),
    supabase
      .from("slot_instances")
      .select("*, slot_instance_students(student_id)")
      .eq("coach_id", coachId)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(200),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My Availability</h1>
        <p className="text-sm text-gray-500">
          Set your recurring weekly hours, and lock/unlock individual sessions.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">New recurring availability</h2>
        <TemplateForm coaches={[]} students={students ?? []} fixedCoachId={coachId} />
      </Card>

      <div>
        <h2 className="text-sm font-medium mb-3">Upcoming slots (next 8 weeks)</h2>
        <SlotList slots={(slots as SlotRow[]) ?? []} students={students ?? []} />
      </div>
    </div>
  );
}
