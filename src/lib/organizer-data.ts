import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { withCounts } from "@/lib/capacity";
import type { EventItem } from "@/types/event";

// organizer er shob event (draft shoho), taken/available count shoho
export async function getOrganizerEvents(
  organizerId: string,
): Promise<EventItem[]> {
  await connectDB();
  const docs = await Event.find({ organizerId }).sort({ date: 1 }).lean();
  const events = await withCounts(docs);
  // ObjectId/Date plain string e (client component e pathate hole lage)
  return JSON.parse(JSON.stringify(events));
}

// registered / confirmed / attended / cancelled koyta kore
export async function getRegistrationStatusCounts(eventIds: string[]) {
  if (eventIds.length === 0) return {} as Record<string, number>;
  await connectDB();
  const rows = await Registration.aggregate([
    {
      $match: {
        eventId: { $in: eventIds.map((id) => new Types.ObjectId(id)) },
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.count])) as Record<
    string,
    number
  >;
}
