"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { REG_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type Row = {
  registrationId: string;
  name: string;
  email: string;
  selectedSkill: string;
  status: string;
  registeredAt: string;
};

export default function VolunteersTable({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/volunteers`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setTitle(json.event.title);
        setRows(json.volunteers);
      } catch (e) {
        setError((e as Error).message || "Could not load volunteers");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  async function updateStatus(id: string, status: string) {
    const old = rows;
    // age screen e bodlai, fail korle purono state e fire ashi
    setRows((p) =>
      p.map((r) => (r.registrationId === id ? { ...r, status } : r)),
    );

    const res = await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setRows(old);
      toast.error("Could not update status");
      return;
    }
    toast.success("Status updated");
  }

  if (loading)
    return <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />;
  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;

  return (
    <div>
      <Link
        href="/organizer/events"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Back to events
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-1 mb-6 text-gray-600">
        {rows.length} volunteer(s) registered
      </p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-600">
          No volunteers have registered yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-175 text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Registered on</th>
                <th className="p-3">Skill</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.registrationId} className="border-b last:border-0">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{formatDate(r.registeredAt)}</td>
                  <td className="p-3">{r.selectedSkill}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        updateStatus(r.registrationId, e.target.value)
                      }
                      className="rounded-lg border px-2 py-1 capitalize"
                    >
                      {REG_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
