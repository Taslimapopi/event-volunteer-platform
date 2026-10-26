import Link from "next/link";
import ManageEvents from "@/components/organizer/ManageEvents";

export default function ManageEventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Manage events</h1>
        <Link
          href="/organizer/events/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create event
        </Link>
      </div>
      <ManageEvents />
    </main>
  );
}
