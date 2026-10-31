import { describe, it, expect } from "vitest";
import { calculatePriority } from "@/services/priority.service";
import { filterAnnouncements } from "@/services/announcement.service";
import { Announcement } from "@/types/database";

describe("Phase 3 Frontend Logic & Services", () => {
  it("calculates priority correctly when deadline is tomorrow", () => {
    const today = new Date("2026-11-01T10:00:00Z");
    const tomorrow = "2026-11-02T23:59:59Z";
    const nextWeek = "2026-11-15";

    const res = calculatePriority(nextWeek, tomorrow, today);
    expect(res.priority).toBe("urgent");
    expect(res.daysUntilDeadline).toBeLessThanOrEqual(2);
  });

  it("calculates expired state when both event and deadline are in the past", () => {
    const today = new Date("2026-11-10T10:00:00Z");
    const pastDeadline = "2026-11-01T23:59:59Z";
    const pastEvent = "2026-11-05";

    const res = calculatePriority(pastEvent, pastDeadline, today);
    expect(res.priority).toBe("expired");
  });

  it("filters announcements accurately by category and search keyword", () => {
    const items: Announcement[] = [
      {
        id: "1",
        campus_id: "c1",
        created_by: "u1",
        title: "Google Developer Hackathon",
        description: "Coding contest",
        original_text: null,
        category: "Hackathon",
        event_date: "2026-11-15",
        event_time: "09:00",
        timezone: "Asia/Kolkata",
        venue: "Block C",
        registration_deadline: "2026-11-10",
        registration_url: null,
        priority: "urgent",
        status: "published",
        instructions: [],
        missing_fields: [],
        extraction_confidence: 1,
        extraction_status: "verified",
        is_verified: true,
        created_at: "",
        updated_at: "",
      },
      {
        id: "2",
        campus_id: "c1",
        created_by: "u1",
        title: "Semester Exams Schedule",
        description: "Official timetable",
        original_text: null,
        category: "Academic",
        event_date: "2026-11-20",
        event_time: "10:00",
        timezone: "Asia/Kolkata",
        venue: "Hall 1",
        registration_deadline: null,
        registration_url: null,
        priority: "upcoming",
        status: "published",
        instructions: [],
        missing_fields: [],
        extraction_confidence: 1,
        extraction_status: "manual",
        is_verified: true,
        created_at: "",
        updated_at: "",
      },
    ];

    const result = filterAnnouncements(items, {
      searchQuery: "hackathon",
      category: "Hackathon",
    });

    expect(result.length).toBe(1);
    expect(result[0].title).toContain("Google Developer Hackathon");
  });
});

