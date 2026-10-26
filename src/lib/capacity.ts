import { Types } from "mongoose";
import { Registration } from "@/models/Registration";

export async function countTaken(eventId: string | Types.ObjectId) {
  return Registration.countDocuments({ eventId, status: { $ne: "cancelled" } });
}

// onek event er taken/available ek query te ber kore
export async function withCounts<
  T extends { _id: Types.ObjectId; capacity: number },
>(events: T[]) {
  const rows = await Registration.aggregate([
    {
      $match: {
        eventId: { $in: events.map((e) => e._id) },
        status: { $ne: "cancelled" },
      },
    },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>(
    rows.map((r) => [String(r._id), r.count]),
  );
  return events.map((e) => {
    const taken = map.get(String(e._id)) ?? 0;
    return { ...e, taken, available: Math.max(e.capacity - taken, 0) };
  });
}
