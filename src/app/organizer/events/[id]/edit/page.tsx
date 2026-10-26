import { notFound, redirect } from "next/navigation";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import EventForm from "@/components/organizer/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();
  const e = await Event.findOne({
    _id: id,
    organizerId: session.user.id,
  }).lean();
  if (!e) notFound();

  const day = (d: Date) => d.toISOString().slice(0, 10); // "2026-11-05" (date input er format)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Edit event</h1>
      <EventForm
        eventId={id}
        initial={{
          title: e.title,
          description: e.description,
          date: day(e.date),
          location: e.location,
          category: e.category,
          capacity: String(e.capacity),
          skills: e.requiredSkills.join(", "),
          registrationDeadline: day(e.registrationDeadline),
        }}
      />
    </main>
  );
}
