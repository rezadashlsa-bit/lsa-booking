import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: profile, error: rpcError } = await supabase.rpc("ensure_profile");

  if (rpcError || !profile) {
    return NextResponse.redirect(`${origin}/pending-approval`);
  }

  const destination =
    profile.role === "admin" ? "/admin" : profile.role === "coach" ? "/coach" : "/parent";

  return NextResponse.redirect(`${origin}${destination}`);
}
