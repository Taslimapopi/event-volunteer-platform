"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AiResult } from "@/lib/ai";

export default function AiAssistant({
  onApply,
}: {
  onApply: (r: AiResult) => void;
}) {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [promo, setPromo] = useState("");

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not generate content");
        return;
      }
      setResult(json);
      setPromo(json.promo);
      onApply(json); // description + skills form e boshe jabe
      toast.success("Draft generated. Review and edit it below.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="font-semibold text-indigo-900">✨ AI event assistant</h2>
      <p className="mt-1 text-sm text-indigo-800">
        Write a short idea and get a draft description, volunteer roles, skills
        and a promo message.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="We want to organize a tree plantation program"
          className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="button" // form er bhitore, tai type="button" na dile form submit hoye jabe
          onClick={generate}
          disabled={loading || idea.trim().length < 5}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-indigo-800">
            Description and skills were filled into the form below. You can edit
            everything before saving.
            {result.source === "mock" &&
              " (Sample content, since no live AI key is configured.)"}
          </p>

          <div>
            <p className="mb-1 font-medium text-indigo-900">
              Suggested volunteer roles
            </p>
            <div className="flex flex-wrap gap-2">
              {result.roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-white px-3 py-1 text-indigo-800"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 font-medium text-indigo-900">
              Promotional message
            </p>
            <textarea
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(promo);
                toast.success("Copied");
              }}
              className="mt-1 text-xs text-indigo-700 underline"
            >
              Copy message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
