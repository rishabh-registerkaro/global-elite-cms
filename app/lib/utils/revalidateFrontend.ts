// Fire-and-forget cache invalidation on the frontend (Global-Elite website).
// Called automatically after service page mutations so creates, edits and
// deletes show on the live site immediately — no manual "revalidate" needed.

export async function revalidateFrontendTags(tags: string[]): Promise<void> {
  const FRONTEND_URL = process.env.PRODUCTION_URL || "http://localhost:3001";
  try {
    await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": process.env.REVALIDATE_SECRET || "",
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    // Never fail the mutation because the frontend cache couldn't be cleared —
    // the admin can still use the manual revalidate button.
    console.log("Frontend revalidation failed:", error);
  }
}

export const serviceTags = (slug: string) => ["service-list", `service-${slug}`];
