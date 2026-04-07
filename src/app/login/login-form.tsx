"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupabase(createSupabaseBrowserClient());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setStatus(null);
    setLoading(true);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setStatus("Check your email for a sign-in link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/app/inbox";
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">TicketPilot</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Sign in to manage tickets and AI autopilot.
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "magic"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
            }`}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "password"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
            }`}
          >
            Password
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {mode === "password" && (
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          )}

          <button
            disabled={loading || !supabase}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            type="submit"
          >
            {!supabase ? "Loading…" : loading ? "Signing in…" : "Sign in"}
          </button>

          {status && (
            <p className="text-sm text-zinc-700" aria-live="polite">
              {status}
            </p>
          )}
        </form>

        <p className="mt-6 text-xs text-zinc-500">
          Tip: enable Email confirmations and magic links in Supabase Auth.
        </p>
      </div>
    </div>
  );
}
