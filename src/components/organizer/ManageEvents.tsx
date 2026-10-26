"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { EventItem } from "@/types/event";

export default function ManageEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/organizer/events");
        if (!res.ok) throw new Error();
        setEvents(await res.json());
      } catch {
        setError("Could not load events. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function changeStatus(id: string, action: "publish" | "close") {
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Action failed");
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: json.status } : e)),
    );
    toast.success(
      action === "publish" ? "Event published" : "Registrations closed",
    );
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/events/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not delete event");
      return;
    }
    setEvents((prev) => prev.filter((e) => e._id !== deleteId));
    setDeleteId(null);
    toast.success("Event deleted");
  }

  if (loading)
    return <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />;
  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
        <p className="font-medium">You haven&apos;t created any events yet</p>
        <Link
          href="/organizer/events/new"
          className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >
          Create your first event →
        </Link>
      </div>
    );
  }

  const btn = "rounded border px-2.5 py-1 text-xs hover:bg-gray-50";

  return (
    <>
      {/* chhoto screen e table scroll hobe, page na */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-175 text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Event</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Volunteers</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-gray-500">{e.location}</p>
                </td>
                <td className="p-3">{formatDate(e.date)}</td>
                <td className="p-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="p-3">
                  {e.taken} / {e.capacity}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/organizer/events/${e._id}/volunteers`}
                      className={btn}
                    >
                      Volunteers
                    </Link>
                    <Link
                      href={`/organizer/events/${e._id}/edit`}
                      className={btn}
                    >
                      Edit
                    </Link>
                    {e.status === "draft" && (
                      <button
                        onClick={() => changeStatus(e._id, "publish")}
                        className={btn}
                      >
                        Publish
                      </button>
                    )}
                    {e.status === "published" && (
                      <button
                        onClick={() => changeStatus(e._id, "close")}
                        className={btn}
                      >
                        Close registration
                      </button>
                    )}
                    {e.status === "closed" && (
                      <button
                        onClick={() => changeStatus(e._id, "publish")}
                        className={btn}
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(e._id)}
                      className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this event?"
        message="This will also remove all volunteer registrations for it. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
