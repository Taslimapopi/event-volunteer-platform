// search er text e special character thakle regex bhenge jay, tai escape kori
export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
