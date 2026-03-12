import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a 24h time string like "14:30" to "2:30 PM"
 */
export function formatTimeIn12Hour(time: string): string {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Returns a human-readable label for the archive/active action.
 */
export function archiveButtonDataTip(
  isActive?: boolean,
  isArchive?: boolean
): string {
  if (isActive !== undefined) {
    return isActive ? "Deactivate" : "Activate";
  }
  return isArchive ? "Unarchive" : "Archive";
}

/**
 * Builds a full image URL from a relative path.
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return (process.env.NEXT_PUBLIC_SPACES_URL ?? "") + path;
}

/**
 * Maps an event status key to a display label.
 */
export function getEventStatusLabel(status: string): string {
  const map: Record<string, string> = {
    nowSelling: "Now Selling",
    upcoming: "Upcoming",
    past: "Past",
    voteToBring: "Vote to Bring",
  };
  return map[status] ?? status;
}
