import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";

export default async function CoachStudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*, families(primary_parent_name)")
    .eq("active", true)
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Students</h1>
      <div className="space-y-2">
        {students?.map((s) => {
          const family = s.families as unknown as { primary_parent_name: string } | null;
          return (
            <Card key={s.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {family?.primary_parent_name}
                  {s.grade ? ` · Grade ${s.grade}` : ""}
                </p>
              </div>
              <Badge tone={s.type === "hp" ? "green" : "neutral"}>
                {s.type === "hp" ? "HP" : "General"}
              </Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
