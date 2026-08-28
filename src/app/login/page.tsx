"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="font-serif text-sm tracking-widest text-lsa-green-sage uppercase mb-2">
          Lowry Sports Academy
        </p>
        <h1 className="text-2xl font-semibold text-lsa-black mb-1">RAS Tennis Bookings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Sign in with the Google account on file with LSA to book or manage sessions.
        </p>
        <Button onClick={handleSignIn} disabled={loading} className="w-full">
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
