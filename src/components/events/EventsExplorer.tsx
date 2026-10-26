"use client";

import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { CATEGORIES } from "@/lib/constants";
import type { EventItem } from "@/types/event";

export default function EventsExplorer() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("upcoming");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        if (when) params.set("when", when);

        const res = await fetch(`/api/events?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Request failed");
        setEvents(await res.json());
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not load events. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    // filter bodlale purono request batil
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, category, location, when]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

  function clearFilters() {
    setQ("");
    setCategory("");
    setLocation("");
    setWhen("upcoming");
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className={`${inputClass} lg:col-span-2`}
          placeholder="Search by title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select
          className={inputClass}
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="">All dates</option>
        </select>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-60 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <p className="font-medium">No events found</p>
            <p className="mt-1 text-sm text-gray-600">
              Try changing your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
