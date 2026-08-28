"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37.5 24 37.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 40.6 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.4-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

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
    <main className="relative flex flex-1 items-center justify-center px-4 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-lsa-green-mint/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-lsa-sand/60 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-lsa-border bg-white/90 backdrop-blur px-8 py-10 shadow-[0_8px_30px_rgba(1,1,1,0.08)] text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-lsa-green-deep font-serif text-xl font-semibold text-white">
            L
          </span>
          <p className="font-serif text-xs tracking-[0.2em] text-lsa-green-sage uppercase mt-4 mb-1">
            Lowry Sports Academy
          </p>
          <h1 className="text-2xl font-semibold text-lsa-black mb-2">RAS Tennis Bookings</h1>
          <p className="text-sm text-gray-500 mb-8">
            Sign in with the Google account on file with LSA to book or manage sessions.
          </p>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-lsa-border bg-white px-4 py-3 text-sm font-medium text-lsa-black shadow-sm transition-all hover:shadow-md hover:border-lsa-green-sage disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            <GoogleIcon />
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </main>
  );
}
