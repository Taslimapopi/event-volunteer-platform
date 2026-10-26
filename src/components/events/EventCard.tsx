import Link from "next/link";
import type { EventItem } from "@/types/event";
import { formatDate, registrationState } from "@/lib/utils";

const badges = {
  open: ["Open", "bg-green-100 text-green-700"],
  full: ["Full", "bg-red-100 text-red-700"],
  closed: ["Registration closed", "bg-gray-200 text-gray-700"],
  deadline: ["Deadline passed", "bg-yellow-100 text-yellow-800"],
  past: ["Past event", "bg-gray-200 text-gray-700"],
} as const;

export default function EventCard({ event }: { event: EventItem }) {
  const [label, color] = badges[registrationState(event)];

  return (
    <Link
      href={`/events/${event._id}`}
      className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {event.category}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
        >
          {label}
        </span>
      </div>

      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
        {event.description}
      </p>

      <dl className="mt-4 space-y-1 text-sm text-gray-700">
        <div>📅 {formatDate(event.date)}</div>
        <div>📍 {event.location}</div>
        <div>⏰ Register by {formatDate(event.registrationDeadline)}</div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {event.requiredSkills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium">
        {event.available > 0
          ? `${event.available} of ${event.capacity} slots available`
          : "No slots left"}
      </p>
    </Link>
  );
}
