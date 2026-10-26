import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { withCounts } from "@/lib/capacity";
import EventCard from "@/components/events/EventCard";
import type { EventItem } from "@/types/event";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectDB();
  const docs = await Event.find({
    status: "published",
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(3)
    .lean();
  const events: EventItem[] = JSON.parse(
    JSON.stringify(await withCounts(docs)),
  );

  return (
    <main>
      <section className="bg-linear-to-br from-indigo-600 to-purple-600 px-4 py-20 text-center text-white">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          Give your time. Make your community better.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
          Organizers publish events, volunteers find opportunities that match
          their skills.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="rounded-lg bg-white px-5 py-2.5 font-medium text-indigo-700"
          >
            Browse events
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/60 px-5 py-2.5 font-medium"
          >
            Join now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Upcoming events</h2>
          <Link
            href="/events"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-600">
            No upcoming events yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
