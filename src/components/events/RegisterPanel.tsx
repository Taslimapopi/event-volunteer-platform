"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { EventItem } from "@/types/event";
import { registrationState } from "@/lib/utils";

type MyReg = { _id: string; status: string; eventId: { _id: string } };

const blockedMessage = {
  past: "This event has already taken place.",
  closed: "Registration for this event is closed.",
  deadline: "The registration deadline has passed.",
  full: "This event is full. No slots are available.",
} as const;

export default function RegisterPanel({ event }: { event: EventItem }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [skill, setSkill] = useState(event.requiredSkills[0] ?? "");
  const [myReg, setMyReg] = useState<MyReg | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const role = session?.user.role;
  const state = registrationState(event);
  const percent = Math.min(
    100,
    Math.round((event.taken / event.capacity) * 100),
  );

  // volunteer ei event e age thekei registered kina
  useEffect(() => {
    if (role !== "volunteer") return;
    let ignore = false;
    (async () => {
      const res = await fetch("/api/registrations");
      if (!res.ok || ignore) return;
      const regs: MyReg[] = await res.json();
      setMyReg(
        regs.find(
          (r) => r.eventId._id === event._id && r.status !== "cancelled",
        ) ?? null,
      );
    })();
    return () => {
      ignore = true;
    };
  }, [role, event._id]);

  async function register() {
    setSubmitting(true);
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event._id, selectedSkill: skill }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(json.error ?? "Registration failed");
      router.refresh(); // slot count notun kore ano
      return;
    }
    toast.success("You're registered!");
    setMyReg({
      _id: json._id,
      status: json.status,
      eventId: { _id: event._id },
    });
    router.refresh();
  }

  function action() {
    if (status === "loading")
      return <div className="h-10 animate-pulse rounded-lg bg-gray-200" />;

    if (!session) {
      return (
        <Link
          href={`/login?callbackUrl=/events/${event._id}`}
          className="block rounded-lg bg-indigo-600 py-2.5 text-center font-medium text-white hover:bg-indigo-700"
        >
          Log in to register
        </Link>
      );
    }

    if (role === "organizer") {
      return (
        <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Organizers can&apos;t register as volunteers.
        </p>
      );
    }

    if (myReg) {
      return (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">You&apos;re registered ✅</p>
          <p className="mt-1 capitalize">Status: {myReg.status}</p>
          <Link
            href="/volunteer/my-events"
            className="mt-2 inline-block underline"
          >
            View my events
          </Link>
        </div>
      );
    }

    if (state !== "open") {
      return (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {blockedMessage[state]}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium">Choose your skill</label>
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {event.requiredSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={register}
          disabled={submitting || !skill}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Registering..." : "Register as volunteer"}
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span>{event.taken} registered</span>
          <span className="font-medium">
            {event.available > 0 ? `${event.available} slots left` : "Full"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full ${event.available === 0 ? "bg-red-500" : "bg-indigo-600"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Capacity: {event.capacity}</p>
      </div>
      {action()}
    </div>
  );
}
