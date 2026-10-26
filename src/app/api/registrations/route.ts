import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { requireRole } from "@/lib/api-auth";
import { countTaken } from "@/lib/capacity";

const bodySchema = z.object({
  eventId: z.string(),
  selectedSkill: z.string().min(1, "Select a skill"),
});

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

// volunteer register kore
export async function POST(req: Request) {
  const auth = await requireRole("volunteer"); // organizer ekhane 403 pabe
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid data", 400);
  const { eventId, selectedSkill } = parsed.data;
  if (!Types.ObjectId.isValid(eventId)) return fail("Event not found", 404);

  await connectDB();
  const event = await Event.findById(eventId);
  if (!event || event.status === "draft") return fail("Event not found", 404);

  const now = new Date();
  if (event.status === "closed") return fail("Registration is closed", 400);
  if (now > event.registrationDeadline)
    return fail("Registration deadline has passed", 400);
  if (now > event.date) return fail("This event has already finished", 400);
  if (!event.requiredSkills.includes(selectedSkill))
    return fail("Invalid skill", 400);
  if ((await countTaken(event._id)) >= event.capacity)
    return fail("This event is full", 409);

  const userId = auth.session.user.id;
  const existing = await Registration.findOne({ eventId, userId });
  let reg;

  if (existing) {
    if (existing.status !== "cancelled")
      return fail("You are already registered", 409);
    // ager cancel kora registration abar chalu korchi
    existing.status = "registered";
    existing.selectedSkill = selectedSkill;
    reg = await existing.save();
  } else {
    try {
      reg = await Registration.create({ eventId, userId, selectedSkill });
    } catch (err) {
      // unique index duplicate dhorle
      if ((err as { code?: number }).code === 11000)
        return fail("You are already registered", 409);
      throw err;
    }
  }

  // ek shathe onek jon register korle capacity peri jabe, ei jonno abar count kori
  if ((await countTaken(event._id)) > event.capacity) {
    reg.status = "cancelled";
    await reg.save();
    return fail("This event is full", 409);
  }

  return NextResponse.json(reg, { status: 201 });
}

// volunteer er nijer registration
export async function GET() {
  const auth = await requireRole("volunteer");
  if ("error" in auth) return auth.error;

  await connectDB();
  const regs = await Registration.find({ userId: auth.session.user.id })
    .populate("eventId")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(regs.filter((r) => r.eventId)); // deleted event bad
}
