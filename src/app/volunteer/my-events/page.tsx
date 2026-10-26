import MyEvents from "@/components/volunteer/MyEvents";

export default function MyEventsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Events</h1>
      <p className="mt-1 mb-8 text-gray-600">
        Track and manage your volunteer registrations.
      </p>
      <MyEvents />
    </main>
  );
}
