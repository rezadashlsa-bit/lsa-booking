import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

export default async function RootPage() {
  const session = await getSessionProfile();

  if (!session) {
    redirect("/login");
  }
  if (!session.profile) {
    redirect("/pending-approval");
  }

  redirect(
    session.profile.role === "admin"
      ? "/admin"
      : session.profile.role === "coach"
        ? "/coach"
        : "/parent"
  );
}
