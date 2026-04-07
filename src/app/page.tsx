import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">
          TicketPilot App
        </h1>
        <p className="mt-2 text-zinc-600">
          This is the app workspace (auth + inbox). The marketing landing page is
          separate.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/app/inbox"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Go to inbox
          </Link>
        </div>
        <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
          <div className="font-semibold">Next steps</div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Copy `.env.example` to `.env.local` and fill Supabase keys.</li>
            <li>Run `supabase/schema.sql` in your Supabase SQL editor.</li>
            <li>Create your first organization + membership row.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
