import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { generateEventContent } from "@/lib/ai";

const bodySchema = z.object({
  idea: z
    .string()
    .trim()
    .min(5, "Describe your idea in a few words")
    .max(300, "Keep it under 300 characters"),
});

export async function POST(req: Request) {
  const auth = await requireRole("organizer"); // shudhu organizer AI use korte parbe
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const result = await generateEventContent(parsed.data.idea);
  return NextResponse.json(result);
}
