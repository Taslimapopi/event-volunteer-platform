import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrganizerEvents } from "@/lib/organizer-data";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrganizerDashboard() {
  const session = await getServerSession(authOptions);
  // proxy.ts er pore page level e-o check (defense in depth)
  if (!session || session.user.role !== "organizer") redirect("/unauthorized");

  const events = await getOrganizerEvents(session.user.id);
  const now = new Date();

  const live = events.filter((e) => e.status !== "draft");
  const upcoming = live.filter((e) => new Date(e.date) >= now);
  const completed = live.filter((e) => new Date(e.date) < now);
  const totalVolunteers = events.reduce((sum, e) => sum + e.taken, 0);
  const availableSlots = upcoming
    .filter((e) => e.status === "published")
    .reduce((sum, e) => sum + e.available, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Organizer dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {session.user.name}.
          </p>
        </div>
        <Link
          href="/organizer/events/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create event
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total events" value={events.length} />
        <StatCard label="Upcoming events" value={upcoming.length} />
        <StatCard label="Total volunteers" value={totalVolunteers} />
        <StatCard label="Available slots" value={availableSlots} />
        <StatCard label="Completed events" value={completed.length} />
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold">Upcoming events</h2>

      {upcoming.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-600">
          No upcoming events. Create one and publish it!
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((e) => {
            const percent = Math.min(
              100,
              Math.round((e.taken / e.capacity) * 100),
            );
            return (
              <div
                key={e._id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(e.date)} · {e.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={e.status} />
                    <Link
                      href={`/organizer/events/${e._id}/volunteers`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Volunteers →
                    </Link>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-600">
                    <span>
                      {e.taken} / {e.capacity} registered
                    </span>
                    <span>
                      {e.available > 0 ? `${e.available} slots left` : "Full"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${e.available === 0 ? "bg-red-500" : "bg-indigo-600"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
