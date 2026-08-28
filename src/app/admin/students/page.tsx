import { createClient } from "@/lib/supabase/server";
import { createStudent, setStudentActive } from "@/lib/actions/admin-actions";
import { Card, Badge } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import { ToggleActiveButton } from "@/components/ui/ToggleActiveButton";

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: families }] = await Promise.all([
    supabase
      .from("students")
      .select("*, families(primary_parent_name)")
      .order("created_at", { ascending: false }),
    supabase.from("families").select("id, primary_parent_name").order("primary_parent_name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Students</h1>
        <p className="text-sm text-gray-500">
          HP students can book makeup/additional sessions; general students can only book
          open-hour slots.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">Add student</h2>
        <ActionForm action={createStudent} submitLabel="Add student">
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="family_id">Family</Label>
              <Select id="family_id" name="family_id" required defaultValue="">
                <option value="" disabled>
                  Select family
                </option>
                {families?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.primary_parent_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" required defaultValue="hp">
                <option value="hp">HP / NCAA Pathway</option>
                <option value="general">General RAS</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade (optional)</Label>
              <Input id="grade" name="grade" />
            </div>
          </div>
        </ActionForm>
      </Card>

      <div className="space-y-2">
        {students?.length === 0 && <p className="text-sm text-gray-500">No students yet.</p>}
        {students?.map((student) => {
          async function toggle(next: boolean) {
            "use server";
            return setStudentActive(student.id, next);
          }
          const family = student.families as unknown as { primary_parent_name: string } | null;
          return (
            <Card key={student.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {student.name}{" "}
                  <Badge tone={student.type === "hp" ? "green" : "neutral"} className="ml-1">
                    {student.type === "hp" ? "HP" : "General"}
                  </Badge>
                </p>
                <p className="text-sm text-gray-500">
                  {family?.primary_parent_name}
                  {student.grade ? ` · Grade ${student.grade}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={student.active ? "green" : "neutral"}>
                  {student.active ? "Active" : "Inactive"}
                </Badge>
                <ToggleActiveButton active={student.active} onToggle={toggle} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
