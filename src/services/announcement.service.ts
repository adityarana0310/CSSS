import { Announcement, AnnouncementCategory, AnnouncementPriority } from "@/types/database";

export interface AnnouncementFilters {
  searchQuery?: string;
  category?: AnnouncementCategory | "all";
  priority?: AnnouncementPriority | "all";
  onlyVerified?: boolean;
}

export function filterAnnouncements(
  announcements: Announcement[],
  filters: AnnouncementFilters
): Announcement[] {
  return announcements.filter((item) => {
    // 1. Search Query
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchVenue = item.venue?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchVenue && !matchCategory) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.category && filters.category !== "all") {
      if (item.category !== filters.category) {
        return false;
      }
    }

    // 3. Priority Filter
    if (filters.priority && filters.priority !== "all") {
      if (item.priority !== filters.priority) {
        return false;
      }
    }

    // 4. Verified Filter
    if (filters.onlyVerified) {
      if (!item.is_verified) {
        return false;
      }
    }

    return true;
  });
}

