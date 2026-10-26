import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Registration } from "@/models/Registration";
import type { EventDoc } from "@/models/Event";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VolunteerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();
  const all = await Registration.find({ userId: session.user.id })
    .populate<{
      eventId: (EventDoc & { _id: Types.ObjectId }) | null;
    }>("eventId")
    .lean();

  const regs = all.filter((r) => r.eventId); // deleted event bad
  const now = new Date();
  const upcoming = regs
    .filter((r) => r.status !== "cancelled" && r.eventId!.date >= now)
    .sort((a, b) => +a.eventId!.date - +b.eventId!.date);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Hello, {session.user.name} 👋</h1>
      <p className="mt-1 text-gray-600">
        Here&apos;s your volunteering overview.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming events" value={upcoming.length} />
        <StatCard
          label="Attended"
          value={regs.filter((r) => r.status === "attended").length}
        />
        <StatCard
          label="Cancelled"
          value={regs.filter((r) => r.status === "cancelled").length}
        />
        <StatCard label="Total registrations" value={regs.length} />
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your next events</h2>
        <Link
          href="/events"
          className="text-sm text-indigo-600 hover:underline"
        >
          Browse more →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-600">
          You haven&apos;t registered for any upcoming event yet.
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.slice(0, 5).map((r) => (
            <Link
              key={String(r._id)}
              href={`/events/${r.eventId!._id}`}
              className="flex items-center justify-between rounded-xl border bg-white p-4 hover:shadow-sm"
            >
              <div>
                <p className="font-medium">{r.eventId!.title}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(r.eventId!.date)} · {r.eventId!.location}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
