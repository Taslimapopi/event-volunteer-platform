import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Registration, REG_STATUSES } from "@/models/Registration";
import { requireRole } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole(); // je kono logged in user
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Registration not found", 404);

  const parsed = z
    .object({ status: z.enum(REG_STATUSES) })
    .safeParse(await req.json());
  if (!parsed.success) return fail("Invalid status", 400);
  const { status } = parsed.data;

  await connectDB();
  const reg = await Registration.findById(id);
  if (!reg) return fail("Registration not found", 404);
  const event = await Event.findById(reg.eventId);
  if (!event) return fail("Event not found", 404);

  const { role, id: userId } = auth.session.user;

  if (role === "volunteer") {
    if (String(reg.userId) !== userId) return fail("Forbidden", 403); // onner registration na
    if (status !== "cancelled")
      return fail("You can only cancel your registration", 403);
    if (new Date() > event.date)
      return fail("You can't cancel after the event has started", 400);
  } else {
    if (String(event.organizerId) !== userId) return fail("Forbidden", 403); // onner event na
  }

  reg.status = status;
  await reg.save();
  return NextResponse.json(reg);
}
