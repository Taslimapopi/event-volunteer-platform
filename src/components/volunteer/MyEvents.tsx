"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

type Reg = {
  _id: string;
  status: "registered" | "confirmed" | "attended" | "cancelled";
  selectedSkill: string;
  eventId: {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    registrationDeadline: string;
  };
};

export default function MyEvents() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/registrations");
        if (!res.ok) throw new Error();
        setRegs(await res.json());
      } catch {
        setError("Could not load your events. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const upcoming = regs.filter((r) => new Date(r.eventId.date) >= now);
  const past = regs.filter((r) => new Date(r.eventId.date) < now);
  const list = tab === "upcoming" ? upcoming : past;

  async function confirmCancel() {
    if (!cancelId) return;
    setCancelling(true);
    const res = await fetch(`/api/registrations/${cancelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const json = await res.json();
    setCancelling(false);

    if (!res.ok) {
      toast.error(json.error ?? "Could not cancel");
      return;
    }
    // server theke abar na ene local state e-i status bodle dei
    setRegs((prev) =>
      prev.map((r) => (r._id === cancelId ? { ...r, status: "cancelled" } : r)),
    );
    setCancelId(null);
    toast.success("Registration cancelled");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    );
  }
  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
          <p className="font-medium">No {tab} events</p>
          {tab === "upcoming" && (
            <Link
              href="/events"
              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
            >
              Browse events →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const e = r.eventId;
            const canCancel =
              tab === "upcoming" &&
              (r.status === "registered" || r.status === "confirmed");
            return (
              <div
                key={r._id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/events/${e._id}`}
                      className="text-lg font-semibold hover:text-indigo-600"
                    >
                      {e.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600">
                      📅 {formatDate(e.date)} · 📍 {e.location} · {e.category}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Your skill: {r.selectedSkill}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {canCancel && (
                  <button
                    onClick={() => setCancelId(r._id)}
                    className="mt-4 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cancel registration
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel registration?"
        message="Your slot will be released for other volunteers."
        confirmLabel="Yes, cancel"
        danger
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
