// search er text e special character thakle regex bhenge jay, tai escape kori
export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// UTC fix kora, jate server ar browser e ek-i date dekhay (hydration error hoy na)
export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ekta event e ekhon register kora jabe kina, na hole keno jabe na
export function registrationState(e: {
  status: string;
  date: string | Date;
  registrationDeadline: string | Date;
  available: number;
}) {
  const now = new Date();
  if (new Date(e.date) < now) return "past";
  if (e.status === "closed") return "closed";
  if (new Date(e.registrationDeadline) < now) return "deadline";
  if (e.available <= 0) return "full";
  return "open";
}
