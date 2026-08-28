import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { TemplateForm } from "@/components/availability/TemplateForm";
import { SlotList, type SlotRow } from "@/components/availability/SlotList";

export default async function AdminAvailabilityPage() {
  const supabase = await createClient();

  const [{ data: coaches }, { data: students }, { data: slots }] = await Promise.all([
    supabase.from("coaches").select("id, name").eq("active", true).order("name"),
    supabase.from("students").select("id, name, type").eq("active", true).order("name"),
    supabase
      .from("slot_instances")
      .select("*, coaches(name), slot_instance_students(student_id)")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(200),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Availability</h1>
        <p className="text-sm text-gray-500">
          Create recurring hours for any coach, and lock/unlock individual sessions.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">New recurring availability</h2>
        <TemplateForm coaches={coaches ?? []} students={students ?? []} />
      </Card>

      <div>
        <h2 className="text-sm font-medium mb-3">Upcoming slots (next 8 weeks)</h2>
        <SlotList slots={(slots as SlotRow[]) ?? []} students={students ?? []} showCoachName />
      </div>
    </div>
  );
}
