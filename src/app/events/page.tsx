import EventsExplorer from "@/components/events/EventsExplorer";

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse Events</h1>
      <p className="mt-1 mb-8 text-gray-600">
        Find an opportunity that matches your skills.
      </p>
      <EventsExplorer />
    </main>
  );
}
