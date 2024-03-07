/**
 * Returns the closest snapshot of a website available in the Wayback Machine, or null if no snapshot is available.
 *
 * @param domain the domain name of the website
 * @returns the URL of the closest snapshot, or null if no snapshot is available
 */
export async function getClosestSnapshot(
  domain: string,
): Promise<string | null> {
  const baseUrl = "http://archive.org/wayback/available";
  const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const url = `${baseUrl}?url=${domain}&timestamp=${timestamp}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.archived_snapshots.closest?.url || null;
  } catch (error) {
    return null;
  }
}
