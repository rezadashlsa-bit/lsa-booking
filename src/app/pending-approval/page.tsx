import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const session = await getSessionProfile();

  if (!session) {
    redirect("/login");
  }
  if (session.profile) {
    redirect(
      session.profile.role === "admin"
        ? "/admin"
        : session.profile.role === "coach"
          ? "/coach"
          : "/parent"
    );
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Account not recognized</h1>
        <p className="text-sm text-gray-600 mb-1">
          You signed in as <span className="font-medium">{session.email}</span>, but this email
          isn&apos;t linked to a coach or family record yet.
        </p>
        <p className="text-sm text-gray-600 mb-8">
          Please contact LSA admin with the email above so they can add you to the system.
        </p>
        {reason && reason !== "no_match" && (
          <p className="text-xs text-red-600 mb-8 font-mono break-words">Debug detail: {reason}</p>
        )}
        <form action={signOut}>
          <Button type="submit" variant="secondary" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
