import { z } from 'zod';

// =============================================================================
// ANNOUNCEMENT EXTRACTION SCHEMA
// Strict Zod schema used to validate every AI response before DB insertion.
// Any AI response that does not conform to this schema is rejected entirely.
// =============================================================================

export const ANNOUNCEMENT_CATEGORIES = [
  'Academic',
  'Hackathon',
  'Workshop',
  'Cultural',
  'Sports',
  'Placement',
  'Administrative',
  'General',
] as const;

export const ANNOUNCEMENT_PRIORITIES = ['urgent', 'upcoming', 'expired'] as const;

// ISO date pattern YYYY-MM-DD
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
// HH:MM pattern
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ExtractedAnnouncementSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(500, 'Title must be under 500 characters'),

  description: z.string().default(''),

  category: z.enum(ANNOUNCEMENT_CATEGORIES).default('General'),

  // event_date: the date the EVENT occurs — stored as YYYY-MM-DD string
  // MUST NOT be confused with registration_deadline
  event_date: z
    .string()
    .regex(isoDatePattern, 'event_date must be YYYY-MM-DD format')
    .nullable()
    .default(null),

  event_time: z
    .string()
    .regex(timePattern, 'event_time must be HH:MM format')
    .nullable()
    .default(null),

  timezone: z.string().default('Asia/Kolkata'),

  venue: z.string().max(500).nullable().default(null),

  // registration_deadline: the deadline to REGISTER — separate from event_date
  // Stored as YYYY-MM-DD (date part only from AI; time added as 23:59 IST in service layer)
  registration_deadline: z
    .string()
    .regex(isoDatePattern, 'registration_deadline must be YYYY-MM-DD format')
    .nullable()
    .default(null),

  registration_url: z
    .union([
      z.string().url(),
      z.literal(''),
      z.null(),
    ])
    .default(null)
    .transform(v => (v === '' ? null : v)),

  priority: z.enum(ANNOUNCEMENT_PRIORITIES).default('upcoming'),

  instructions: z.array(z.string().max(500)).max(20).default([]),

  missing_fields: z.array(z.string()).default([]),

  extraction_confidence: z
    .number()
    .min(0)
    .max(1)
    .default(1.0),
});

export const ExtractionResponseSchema = z.object({
  announcements: z
    .array(ExtractedAnnouncementSchema)
    .min(1, 'At least one announcement must be extracted'),
});

export type ExtractedAnnouncement = z.infer<typeof ExtractedAnnouncementSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

// =============================================================================
// AI PROVIDER INTERFACE
// Implemented by GeminiProvider (and OfflineProvider for dev/test).
// =============================================================================
export interface IAIExtractionProvider {
  /** Extract structured announcements from raw unstructured text */
  extractAnnouncements(rawText: string): Promise<ExtractionResponse>;

  /** Generate a plain-English weekly digest from actual DB records */
  generateWeeklyDigest(announcements: ExtractedAnnouncement[]): Promise<string>;
}

export class AIProviderUnavailableError extends Error {
  constructor(reason: string) {
    super(`AI provider unavailable: ${reason}`);
    this.name = 'AIProviderUnavailableError';
  }
}

export class AIExtractionError extends Error {
  public readonly rawResponse?: string;
  constructor(message: string, rawResponse?: string) {
    super(message);
    this.name = 'AIExtractionError';
    this.rawResponse = rawResponse;
  }
}
