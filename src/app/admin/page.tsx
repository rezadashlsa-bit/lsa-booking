import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: coachCount }, { count: familyCount }, { count: studentCount }, { count: upcomingCount }, { count: openSlotCount }] =
    await Promise.all([
      supabase.from("coaches").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("families").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "booked"),
      supabase
        .from("slot_instances")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .gt("starts_at", new Date().toISOString()),
    ]);

  const stats = [
    { label: "Active coaches", value: coachCount ?? 0 },
    { label: "Families", value: familyCount ?? 0 },
    { label: "Active students", value: studentCount ?? 0 },
    { label: "Upcoming bookings", value: upcomingCount ?? 0 },
    { label: "Open future slots", value: openSlotCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-2xl font-semibold text-lsa-green-deep">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
