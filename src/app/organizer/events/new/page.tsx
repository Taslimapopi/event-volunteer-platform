import EventForm from "@/components/organizer/EventForm";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Create event</h1>
      <p className="mt-1 mb-8 text-gray-600">
        New events are saved as drafts until you publish them.
      </p>
      <EventForm />
    </main>
  );
}
