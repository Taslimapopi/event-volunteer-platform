import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { eventSchema } from "@/lib/validators/event";
import { requireRole } from "@/lib/api-auth";
import { withCounts } from "@/lib/capacity";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: Request) {
  await connectDB();
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category");
  const location = sp.get("location")?.trim();
  const when = sp.get("when"); // "upcoming" | "past"

  // draft event volunteer ke dekhano jabe na
  const filter: Record<string, unknown> = {
    status: { $in: ["published", "closed"] },
  };
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (category) filter.category = category;
  if (location)
    filter.location = { $regex: escapeRegex(location), $options: "i" };
  if (when === "upcoming") filter.date = { $gte: new Date() };
  if (when === "past") filter.date = { $lt: new Date() };

  const events = await Event.find(filter).sort({ date: 1 }).lean();
  return NextResponse.json(await withCounts(events));
}

export async function POST(req: Request) {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;

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
  // organizerId session theke, body theke na (keu onner nam e event banate parbe na)
  const event = await Event.create({
    ...parsed.data,
    organizerId: auth.session.user.id,
  });
  return NextResponse.json(event, { status: 201 });
}
