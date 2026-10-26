import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { eventSchema } from "@/lib/validators/event";
import { requireRole } from "@/lib/api-auth";
import { countTaken, withCounts } from "@/lib/capacity";

type Ctx = { params: Promise<{ id: string }> };
const notFound = () =>
  NextResponse.json({ error: "Event not found" }, { status: 404 });

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return notFound();
  await connectDB();

  const event = await Event.findById(id).lean();
  if (!event) return notFound();

  // draft shudhu nijer organizer dekhte pabe
  if (event.status === "draft") {
    const session = await getServerSession(authOptions);
    if (session?.user.id !== String(event.organizerId)) return notFound();
  }

  const [result] = await withCounts([event]);
  return NextResponse.json(result);
}

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return notFound();

  const parsed = eventSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid event data",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  await connectDB();
  const event = await Event.findOne({
    _id: id,
    organizerId: auth.session.user.id,
  });
  if (!event) return notFound();

  const taken = await countTaken(event._id);
  if (parsed.data.capacity < taken) {
    return NextResponse.json(
      { error: `Capacity can't be less than current registrations (${taken})` },
      { status: 400 },
    );
  }

  event.set(parsed.data);
  await event.save();
  return NextResponse.json(event);
}

// publish / close
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return notFound();

  const { action } = await req.json();
  if (action !== "publish" && action !== "close") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectDB();
  const event = await Event.findOne({
    _id: id,
    organizerId: auth.session.user.id,
  });
  if (!event) return notFound();

  event.status = action === "publish" ? "published" : "closed";
  await event.save();
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return notFound();

  await connectDB();
  const event = await Event.findOneAndDelete({
    _id: id,
    organizerId: auth.session.user.id,
  });
  if (!event) return notFound();

  await Registration.deleteMany({ eventId: id }); // orphan registration rakhbo na
  return NextResponse.json({ message: "Event deleted" });
}
