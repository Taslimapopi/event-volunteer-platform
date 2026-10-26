import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    date: z.coerce.date({ message: "Valid event date required" }),
    location: z.string().trim().min(2, "Location is required"),
    category: z.string().trim().min(2, "Category is required"),
    capacity: z.coerce
      .number()
      .int()
      .min(1, "Capacity must be at least 1")
      .max(10000),
    requiredSkills: z
      .array(z.string().trim().min(1))
      .min(1, "Add at least one skill"),
    registrationDeadline: z.coerce.date({ message: "Valid deadline required" }),
  })
  .refine((d) => d.registrationDeadline <= d.date, {
    message: "Deadline must be on or before the event date",
    path: ["registrationDeadline"],
  });

export type EventInput = z.infer<typeof eventSchema>;
