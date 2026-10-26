"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";

const formSchema = z
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
    date: z.string().min(1, "Event date is required"),
    location: z.string().trim().min(2, "Location is required"),
    category: z.string().min(1, "Select a category"),
    capacity: z
      .string()
      .regex(/^\d+$/, "Enter a whole number")
      .refine((v) => Number(v) >= 1, "Capacity must be at least 1"),
    skills: z
      .string()
      .trim()
      .min(1, "Add at least one skill (comma separated)"),
    registrationDeadline: z.string().min(1, "Deadline is required"),
  })
  .refine((d) => d.registrationDeadline <= d.date, {
    message: "Deadline must be on or before the event date",
    path: ["registrationDeadline"],
  });

export type EventFormValues = z.infer<typeof formSchema>;

type Props = { eventId?: string; initial?: Partial<EventFormValues> };

export default function EventForm({ eventId, initial }: Props) {
  const router = useRouter();
  const isEdit = !!eventId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      category: "",
      capacity: "",
      skills: "",
      registrationDeadline: "",
      ...initial,
    },
  });

  async function onSubmit(v: EventFormValues) {
    const payload = {
      title: v.title,
      description: v.description,
      date: v.date,
      location: v.location,
      category: v.category,
      capacity: Number(v.capacity),
      requiredSkills: v.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      registrationDeadline: v.registrationDeadline,
    };

    const res = await fetch(isEdit ? `/api/events/${eventId}` : "/api/events", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Could not save event");
      return;
    }
    toast.success(
      isEdit
        ? "Event updated"
        : "Event created as draft. Publish it when ready.",
    );
    router.push("/organizer/events");
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500";
  const err = (msg?: string) =>
    msg && <p className="mt-1 text-sm text-red-600">{msg}</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Event title</label>
        <input
          {...register("title")}
          className={input}
          placeholder="Tree Plantation Drive"
        />
        {err(errors.title?.message)}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea {...register("description")} rows={5} className={input} />
        {err(errors.description?.message)}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Event date</label>
          <input type="date" {...register("date")} className={input} />
          {err(errors.date?.message)}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Registration deadline
          </label>
          <input
            type="date"
            {...register("registrationDeadline")}
            className={input}
          />
          {err(errors.registrationDeadline?.message)}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input
            {...register("location")}
            className={input}
            placeholder="Chittagong"
          />
          {err(errors.location?.message)}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select {...register("category")} className={input}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {err(errors.category?.message)}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Maximum volunteers
          </label>
          <input
            {...register("capacity")}
            inputMode="numeric"
            className={input}
            placeholder="20"
          />
          {err(errors.capacity?.message)}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Required skills
          </label>
          <input
            {...register("skills")}
            className={input}
            placeholder="Planting, Logistics"
          />
          {err(errors.skills?.message)}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create event"}
        </button>
      </div>
    </form>
  );
}
