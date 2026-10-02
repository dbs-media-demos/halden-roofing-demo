/**
 * Previews keep the concept's sample reviews and projects but not its fictional people and places:
 * the Haldens become the business, their crew members become "the team", and project titles lose
 * their Fort Worth suburb.
 */
export function scrubReview(text: string, shortName: string): string {
  return text
    .replace(/\bHalden's\b/g, `${shortName}'s`)
    .replace(/\bHalden\b/g, shortName)
    .replace(/\bMarcus met\b/g, "They met")
    .replace(/\bCody's team\b/g, "Their team")
    .replace(/\bRay himself came by\b/g, "The owner came by");
}

export function scrubProjectTitle(p: { title: string; city: string; neighborhood: string }): string {
  for (const place of [p.neighborhood, p.city]) {
    if (p.title.startsWith(place + " ")) {
      const rest = p.title.slice(place.length + 1);
      return rest[0].toUpperCase() + rest.slice(1);
    }
  }
  return p.title;
}
