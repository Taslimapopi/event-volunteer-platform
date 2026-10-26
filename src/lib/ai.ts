import { z } from "zod";

export type AiResult = {
  description: string;
  roles: string[];
  skills: string[];
  promo: string;
  source: "gemini" | "mock";
};

const aiSchema = z.object({
  description: z.string().min(10),
  roles: z.array(z.string()).min(1),
  skills: z.array(z.string()).min(1),
  promo: z.string().min(5),
});

// ---------- Mock (API key na thakle / fail korle) ----------
const THEMES = [
  {
    match: /tree|plant|green|environment|forest/i,
    roles: [
      "Planting Team",
      "Water Support",
      "Logistics Coordinator",
      "Photographer",
    ],
    skills: ["Planting", "Logistics", "Photography"],
    focus: "protect the environment and make our surroundings greener",
  },
  {
    match: /teach|school|education|student|literacy|tutor/i,
    roles: ["Teaching Volunteer", "Classroom Assistant", "Registration Desk"],
    skills: ["Teaching", "Communication", "Mentoring"],
    focus: "support learners with knowledge and encouragement",
  },
  {
    match: /health|medical|blood|doctor|checkup|clinic/i,
    roles: ["Registration Desk", "First Aid Support", "Crowd Management"],
    skills: ["First Aid", "Registration Desk", "Crowd Management"],
    focus: "bring basic healthcare closer to the community",
  },
  {
    match: /clean|beach|waste|trash|river/i,
    roles: ["Cleanup Crew", "Waste Sorting Lead", "Safety Marshal"],
    skills: ["Cleaning", "Sorting", "Teamwork"],
    focus: "keep our shared spaces clean and safe",
  },
  {
    match: /food|donat|cloth|relief|charity|collect/i,
    roles: ["Collection Desk", "Sorting Team", "Delivery Volunteer"],
    skills: ["Sorting", "Packing", "Driving"],
    focus: "bring essential support to people who need it",
  },
];

export function mockGenerate(idea: string): AiResult {
  const theme = THEMES.find((t) => t.match.test(idea));
  const roles = theme?.roles ?? [
    "Event Coordinator",
    "Volunteer Helper",
    "Registration Desk",
  ];
  const skills = theme?.skills ?? ["Teamwork", "Communication", "Organization"];
  const focus = theme?.focus ?? "make a positive difference in our community";
  const topic = idea.trim().replace(/[.!?]+$/, "");

  return {
    description: `${topic}. This community event brings people together to ${focus}. Volunteers will work in small teams, and no prior experience is needed, just enthusiasm and a willingness to help. Please arrive on time, wear comfortable clothes, and bring a water bottle. Our team will brief everyone at the start and guide you throughout the day.`,
    roles,
    skills,
    promo: `Be the change! Join us for: ${topic}. Limited volunteer slots, register now and bring a friend!`,
    source: "mock",
  };
}

// ---------- Gemini ----------
async function geminiGenerate(idea: string): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `You help community organizers write volunteer event content.
Event idea: "${idea}"

Respond ONLY with JSON in this exact shape:
{
  "description": "2-3 short paragraphs describing the event, in plain text",
  "roles": ["3 to 5 suggested volunteer roles"],
  "skills": ["3 to 5 required skills, one or two words each"],
  "promo": "one short, friendly promotional message under 200 characters"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
      signal: AbortSignal.timeout(15000), // 15 second er beshi opekkha korbo na
    },
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const text: string | undefined =
    data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");

  // model kokhono ```json fence diye pathay, shegulo kete dei
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = aiSchema.parse(JSON.parse(clean));

  return {
    description: parsed.description,
    roles: parsed.roles.slice(0, 6),
    skills: parsed.skills.slice(0, 6),
    promo: parsed.promo,
    source: "gemini",
  };
}

export async function generateEventContent(idea: string): Promise<AiResult> {
  if (!process.env.GEMINI_API_KEY) return mockGenerate(idea);
  try {
    return await geminiGenerate(idea);
  } catch (err) {
    console.error("AI generation failed, using mock:", err);
    return mockGenerate(idea);
  }
}
