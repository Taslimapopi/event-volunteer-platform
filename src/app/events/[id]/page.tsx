import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { withCounts } from "@/lib/capacity";
import { formatDate } from "@/lib/utils";
import RegisterPanel from "@/components/events/RegisterPanel";
import type { EventItem } from "@/types/event";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Event.findById(id).lean();
  if (!doc || doc.status === "draft") notFound(); // deleted ba draft event

  const [withCount] = await withCounts([doc]);
  // ObjectId/Date ke plain string e convert (client component e pathate hole lage)
  const event: EventItem = JSON.parse(JSON.stringify(withCount));

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {event.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold">{event.title}</h1>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium">{formatDate(event.date)}</dd>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <dt className="text-gray-500">Location</dt>
            <dd className="font-medium">{event.location}</dd>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <dt className="text-gray-500">Register by</dt>
            <dd className="font-medium">
              {formatDate(event.registrationDeadline)}
            </dd>
          </div>
        </dl>

        <h2 className="mt-8 text-lg font-semibold">About this event</h2>
        <p className="mt-2 whitespace-pre-line text-gray-700">
          {event.description}
        </p>

        <h2 className="mt-8 text-lg font-semibold">Skills needed</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {event.requiredSkills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <aside>
        <RegisterPanel event={event} />
      </aside>
    </main>
  );
}
