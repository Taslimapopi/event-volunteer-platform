import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getOrganizerEvents,
  getRegistrationStatusCounts,
} from "@/lib/organizer-data";
import AnalyticsCharts from "@/components/organizer/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "organizer") redirect("/unauthorized");

  const events = await getOrganizerEvents(session.user.id);
  const statusCounts = await getRegistrationStatusCounts(
    events.map((e) => e._id),
  );
  const now = new Date();
  const live = events.filter((e) => e.status !== "draft");

  // 1. category wise event count
  const categoryMap: Record<string, number> = {};
  for (const e of events)
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + 1;
  const byCategory = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. event wise registration vs capacity (lomba title kete dei, chart e jeno na bhange)
  const perEvent = live.map((e) => ({
    name: e.title.length > 14 ? `${e.title.slice(0, 13)}…` : e.title,
    registered: e.taken,
    capacity: e.capacity,
  }));

  // 3. upcoming vs completed
  const timeline = [
    {
      name: "Upcoming",
      value: live.filter((e) => new Date(e.date) >= now).length,
    },
    {
      name: "Completed",
      value: live.filter((e) => new Date(e.date) < now).length,
    },
  ];

  // 4. volunteer status
  const volunteerStatus = [
    "registered",
    "confirmed",
    "attended",
    "cancelled",
  ].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: statusCounts[s] ?? 0,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-1 mb-8 text-gray-600">
        A quick look at how your events are performing.
      </p>
      <AnalyticsCharts
        byCategory={byCategory}
        perEvent={perEvent}
        timeline={timeline}
        volunteerStatus={volunteerStatus}
      />
    </main>
  );
}
