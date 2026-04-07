import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TicketRow = {
  id: string;
  subject: string | null;
  customer_email: string | null;
  status: string;
  risk_level: string;
  created_at: string;
};

export default async function InboxPage() {
  const supabase = await createSupabaseServerClient();

  // MVP: show tickets for the first org the user is a member of.
  // Later we’ll add org switcher + multi-tenant routing.
  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .limit(1);

  if (membershipError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load membership: {membershipError.message}
      </div>
    );
  }

  const orgId = memberships?.[0]?.organization_id;

  if (!orgId) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
          No organization found for this user yet.
          <div className="mt-2">
            Create an org row in `public.organizations` and a membership row in
            `public.organization_members`.
          </div>
        </div>
      </div>
    );
  }

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id, subject, customer_email, status, risk_level, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load tickets: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-zinc-600">
            Latest tickets (email ingestion coming next).
          </p>
        </div>
        <Link
          href="/app/inbox"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Refresh
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
          <div className="col-span-6">Subject</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Risk</div>
          <div className="col-span-1 text-right">Age</div>
        </div>

        {(tickets as TicketRow[] | null)?.length ? (
          <ul className="divide-y divide-zinc-100">
            {(tickets as TicketRow[]).map((t) => (
              <li key={t.id} className="grid grid-cols-12 gap-3 px-4 py-3">
                <div className="col-span-6 font-medium text-zinc-900">
                  {t.subject ?? "(no subject)"}
                </div>
                <div className="col-span-3 text-sm text-zinc-600">
                  {t.customer_email ?? "—"}
                </div>
                <div className="col-span-1 text-sm text-zinc-700">
                  {t.status}
                </div>
                <div className="col-span-1 text-sm text-zinc-700">
                  {t.risk_level}
                </div>
                <div className="col-span-1 text-right text-sm text-zinc-600">
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            No tickets yet. Insert a row into `public.tickets` to see it here.
          </div>
        )}
      </div>
    </div>
  );
}

