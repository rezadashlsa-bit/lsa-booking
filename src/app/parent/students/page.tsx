import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { Card, Badge } from "@/components/ui/Card";

export default async function ParentStudentsPage() {
  const session = await getSessionProfile();
  const familyId = session!.profile!.family_id!;
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("family_id", familyId)
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Students</h1>
      <div className="space-y-2">
        {students?.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{s.name}</p>
              {s.grade && <p className="text-sm text-gray-500">Grade {s.grade}</p>}
            </div>
            <Badge tone={s.type === "hp" ? "green" : "neutral"}>
              {s.type === "hp" ? "HP / NCAA Pathway" : "General RAS"}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
