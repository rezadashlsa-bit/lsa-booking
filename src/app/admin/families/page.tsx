import { createClient } from "@/lib/supabase/server";
import { createFamily } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";

export default async function AdminFamiliesPage() {
  const supabase = await createClient();
  const { data: families } = await supabase
    .from("families")
    .select("*, students(id, name, type, active)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Families</h1>
        <p className="text-sm text-gray-500">
          Parents sign in with the Google account matching an email entered here.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">Add family</h2>
        <ActionForm action={createFamily} submitLabel="Add family">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="primary_parent_name">Primary parent name</Label>
              <Input id="primary_parent_name" name="primary_parent_name" required />
            </div>
            <div>
              <Label htmlFor="primary_parent_email">Primary parent email</Label>
              <Input id="primary_parent_email" name="primary_parent_email" type="email" required />
            </div>
            <div>
              <Label htmlFor="secondary_parent_name">Secondary parent name (optional)</Label>
              <Input id="secondary_parent_name" name="secondary_parent_name" />
            </div>
            <div>
              <Label htmlFor="secondary_parent_email">Secondary parent email (optional)</Label>
              <Input id="secondary_parent_email" name="secondary_parent_email" type="email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
        </ActionForm>
      </Card>

      <div className="space-y-2">
        {families?.length === 0 && <p className="text-sm text-gray-500">No families yet.</p>}
        {families?.map((family) => (
          <Card key={family.id}>
            <p className="font-medium">{family.primary_parent_name}</p>
            <p className="text-sm text-gray-500">{family.primary_parent_email}</p>
            {family.secondary_parent_email && (
              <p className="text-sm text-gray-500">
                {family.secondary_parent_name} — {family.secondary_parent_email}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(family.students as { id: string; name: string; type: string; active: boolean }[])?.map(
                (s) => (
                  <span
                    key={s.id}
                    className="text-xs rounded-full bg-lsa-sand/50 px-2 py-0.5 text-lsa-black"
                  >
                    {s.name} ({s.type === "hp" ? "HP" : "General"})
                  </span>
                )
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
