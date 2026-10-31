import { describe, it, expect } from 'vitest';
import { ExtractedAnnouncementSchema } from '@/lib/ai/types';

describe('Phase 1 Scaffolding & Validation Tests', () => {
  it('validates a correct extracted announcement schema', () => {
    const validData = {
      title: 'Annual Tech Symposium',
      description: 'Department of Computer Science annual conference',
      category: 'Workshop',
      event_date: '2026-11-20',
      event_time: '10:00',
      timezone: 'Asia/Kolkata',
      venue: 'Main Auditorium',
      registration_deadline: '2026-11-15',
      registration_url: 'https://example.com/register',
      priority: 'upcoming',
      instructions: ['Bring College ID'],
      missing_fields: [],
      extraction_confidence: 0.98,
    };

    const parsed = ExtractedAnnouncementSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe('Annual Tech Symposium');
      expect(parsed.data.category).toBe('Workshop');
    }
  });

  it('rejects announcement with missing title', () => {
    const invalidData = {
      description: 'Event without title',
    };

    const parsed = ExtractedAnnouncementSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});

