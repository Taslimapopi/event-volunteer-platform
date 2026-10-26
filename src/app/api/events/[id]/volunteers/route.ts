import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { requireRole } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await connectDB();
  const event = await Event.findOne({
    _id: id,
    organizerId: auth.session.user.id,
  }).lean();
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const regs = await Registration.find({ eventId: id })
    .populate<{
      userId: { _id: Types.ObjectId; name: string; email: string };
    }>("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    event: { _id: event._id, title: event.title },
    volunteers: regs.map((r) => ({
      registrationId: r._id,
      name: r.userId?.name,
      email: r.userId?.email,
      selectedSkill: r.selectedSkill,
      status: r.status,
      registeredAt: r.createdAt,
    })),
  });
}
