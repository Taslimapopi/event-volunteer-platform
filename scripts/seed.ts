import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY);

async function upsertUser(
  name: string,
  email: string,
  role: "organizer" | "volunteer",
  hash: string,
) {
  const user = await User.findOneAndUpdate(
    { email },
    { name, email, passwordHash: hash, role },
    { upsert: true, new: true },
  );
  return user!;
}

async function main() {
  await connectDB();
  const hash = await bcrypt.hash("Demo@123", 10);

  const organizer = await upsertUser(
    "Demo Organizer",
    "organizer@demo.com",
    "organizer",
    hash,
  );
  const volunteer = await upsertUser(
    "Demo Volunteer",
    "volunteer@demo.com",
    "volunteer",
    hash,
  );
  const volunteer2 = await upsertUser(
    "Second Volunteer",
    "volunteer2@demo.com",
    "volunteer",
    hash,
  );

  // purono demo event/registration muche notun kore banai
  const old = await Event.find({ organizerId: organizer._id }).select("_id");
  await Registration.deleteMany({ eventId: { $in: old.map((e) => e._id) } });
  await Event.deleteMany({ organizerId: organizer._id });

  const base = { organizerId: organizer._id };
  const [tree, school, health, full, closed, past, draft] =
    await Event.insertMany([
      {
        ...base,
        title: "Tree Plantation Drive",
        category: "Environment",
        location: "Cox's Bazar",
        description:
          "Join us to plant 500 saplings along the coastal belt and protect our shoreline.",
        date: inDays(10),
        registrationDeadline: inDays(7),
        capacity: 20,
        requiredSkills: ["Planting", "Logistics", "Photography"],
        status: "published",
      },
      {
        ...base,
        title: "Free Teaching Camp",
        category: "Education",
        location: "Chittagong",
        description:
          "Spend a weekend teaching basic English and math to children from low-income families.",
        date: inDays(15),
        registrationDeadline: inDays(12),
        capacity: 15,
        requiredSkills: ["Teaching", "Communication"],
        status: "published",
      },
      {
        ...base,
        title: "Community Health Checkup",
        category: "Health",
        location: "Dhaka",
        description:
          "Help our medical team run a free health checkup camp for the local community.",
        date: inDays(20),
        registrationDeadline: inDays(17),
        capacity: 30,
        requiredSkills: ["First Aid", "Registration Desk", "Crowd Management"],
        status: "published",
      },
      {
        ...base,
        title: "Beach Cleanup (Almost Full)",
        category: "Environment",
        location: "Cox's Bazar",
        description:
          "A small-team cleanup of the main beach. Only one slot, used for testing the full state.",
        date: inDays(8),
        registrationDeadline: inDays(6),
        capacity: 1,
        requiredSkills: ["Cleaning"],
        status: "published",
      },
      {
        ...base,
        title: "Winter Clothes Collection",
        category: "Community",
        location: "Chittagong",
        description:
          "Collecting and sorting winter clothes. Registration is closed by the organizer.",
        date: inDays(12),
        registrationDeadline: inDays(9),
        capacity: 10,
        requiredSkills: ["Sorting", "Packing"],
        status: "closed",
      },
      {
        ...base,
        title: "Charity Football Match",
        category: "Sports",
        location: "Dhaka",
        description: "A completed charity match, used for testing past events.",
        date: inDays(-5),
        registrationDeadline: inDays(-8),
        capacity: 25,
        requiredSkills: ["Event Support"],
        status: "published",
      },
      {
        ...base,
        title: "Draft: Blood Donation Camp",
        category: "Health",
        location: "Sylhet",
        description:
          "This one is a draft and should not be visible to volunteers.",
        date: inDays(30),
        registrationDeadline: inDays(25),
        capacity: 40,
        requiredSkills: ["Registration Desk"],
        status: "draft",
      },
    ]);

  await Registration.insertMany([
    {
      eventId: full._id,
      userId: volunteer2._id,
      selectedSkill: "Cleaning",
      status: "confirmed",
    },
    {
      eventId: tree._id,
      userId: volunteer2._id,
      selectedSkill: "Planting",
      status: "registered",
    },
    {
      eventId: past._id,
      userId: volunteer._id,
      selectedSkill: "Event Support",
      status: "attended",
    },
  ]);

  console.log("Seed done. Demo password for all users: Demo@123");
  console.log({
    school: school._id,
    health: health._id,
    closed: closed._id,
    draft: draft._id,
    volunteer: volunteer._id,
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
