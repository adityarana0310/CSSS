import { differenceInDays, parseISO, isBefore, isSameDay } from "date-fns";
import { AnnouncementPriority } from "@/types/database";

export interface PriorityEvaluation {
  priority: AnnouncementPriority;
  reason: string;
  isUrgentToday: boolean;
  daysUntilEvent: number | null;
  daysUntilDeadline: number | null;
}

/**
 * Deterministic priority calculator based on event dates, registration deadlines,
 * and business urgency rules.
 * Does NOT rely on AI for business priority decisions.
 */
export function calculatePriority(
  eventDateStr: string | null,
  registrationDeadlineStr: string | null,
  now: Date = new Date()
): PriorityEvaluation {
  let isUrgentToday = false;
  let daysUntilEvent: number | null = null;
  let daysUntilDeadline: number | null = null;

  const deadlineDate = registrationDeadlineStr ? parseISO(registrationDeadlineStr) : null;
  const eventDate = eventDateStr ? parseISO(eventDateStr) : null;

  if (deadlineDate) {
    daysUntilDeadline = differenceInDays(deadlineDate, now);
    if (isSameDay(deadlineDate, now)) {
      isUrgentToday = true;
    }
  }

  if (eventDate) {
    daysUntilEvent = differenceInDays(eventDate, now);
    if (isSameDay(eventDate, now)) {
      isUrgentToday = true;
    }
  }

  const isDeadlinePast = deadlineDate ? isBefore(deadlineDate, now) : false;
  const isEventPast = eventDate ? isBefore(eventDate, now) : false;

  // 1. Expired state: Both event and deadline have passed (or relevant deadline/event passed if only one exists)
  if (
    (deadlineDate && isDeadlinePast && (!eventDate || isEventPast)) ||
    (!deadlineDate && eventDate && isEventPast)
  ) {
    return {
      priority: "expired",
      reason: "Event or registration cutoff has passed",
      isUrgentToday: false,
      daysUntilEvent,
      daysUntilDeadline,
    };
  }

  // 2. Urgent state: Deadline within 48h or event happening today/tomorrow
  if (
    (daysUntilDeadline !== null && daysUntilDeadline <= 2 && daysUntilDeadline >= 0) ||
    (daysUntilEvent !== null && daysUntilEvent <= 1 && daysUntilEvent >= 0) ||
    isUrgentToday
  ) {
    return {
      priority: "urgent",
      reason: isUrgentToday
        ? "Action required today"
        : "Registration closes or event starts within 48 hours",
      isUrgentToday,
      daysUntilEvent,
      daysUntilDeadline,
    };
  }

  // 3. Upcoming state: Future event / deadline
  return {
    priority: "upcoming",
    reason: "Scheduled in future",
    isUrgentToday: false,
    daysUntilEvent,
    daysUntilDeadline,
  };
}
