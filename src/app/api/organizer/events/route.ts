import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { requireRole } from "@/lib/api-auth";
import { withCounts } from "@/lib/capacity";

export async function GET() {
  const auth = await requireRole("organizer");
  if ("error" in auth) return auth.error;

  await connectDB();
  const events = await Event.find({ organizerId: auth.session.user.id })
    .sort({ date: -1 })
    .lean();
  return NextResponse.json(await withCounts(events));
}
