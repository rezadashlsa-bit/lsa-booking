import { createClient } from "@/lib/supabase/server";
import { createCoach, setCoachActive } from "@/lib/actions/admin-actions";
import { Card, Badge } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/ActionForm";
import { ToggleActiveButton } from "@/components/ui/ToggleActiveButton";

export default async function AdminCoachesPage() {
  const supabase = await createClient();
  const {
    data: coaches,
    error,
    status,
  } = await supabase.from("coaches").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Coaches</h1>
        <p className="text-sm text-gray-500">
          Coaches sign in with the Google account matching the email entered here.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-medium mb-3">Add coach</h2>
        <ActionForm action={createCoach} submitLabel="Add coach">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Google sign-in email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
        </ActionForm>
      </Card>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <p className="text-xs font-mono text-red-700 break-words">
            DEBUG — status: {status}, error: {JSON.stringify(error)}
          </p>
        </Card>
      )}
      <p className="text-xs font-mono text-gray-400">
        DEBUG — status: {status}, rows: {coaches ? coaches.length : "null"}
      </p>

      <div className="space-y-2">
        {coaches?.length === 0 && <p className="text-sm text-gray-500">No coaches yet.</p>}
        {coaches?.map((coach) => {
          async function toggle(next: boolean) {
            "use server";
            return setCoachActive(coach.id, next);
          }
          return (
            <Card key={coach.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{coach.name}</p>
                <p className="text-sm text-gray-500">{coach.email}</p>
                {coach.phone && <p className="text-xs text-gray-400">{coach.phone}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={coach.active ? "green" : "neutral"}>
                  {coach.active ? "Active" : "Inactive"}
                </Badge>
                <ToggleActiveButton active={coach.active} onToggle={toggle} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
