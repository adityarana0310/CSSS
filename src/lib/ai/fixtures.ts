import { ExtractedAnnouncement, ExtractionResponse } from './types';

/**
 * Explicitly labelled mock fixtures strictly for automated tests and offline verification.
 * These fixtures are NEVER presented as live AI results to the user.
 */
export const MOCK_TEST_FIXTURE_HACKATHON: ExtractedAnnouncement = {
  title: '[FIXTURE] GDG Campus Hackathon',
  description: 'Annual campus hackathon organized by GDG chapter for student innovation.',
  category: 'Hackathon',
  event_date: '2026-11-15',
  event_time: '09:00',
  timezone: 'Asia/Kolkata',
  venue: 'Innovation Lab, Block C',
  registration_deadline: '2026-11-10',
  registration_url: 'https://gdg.community.dev/hackathon-2026',
  priority: 'urgent',
  instructions: ['Bring College ID card', 'Team size: 2-4 members', 'Laptop required'],
  missing_fields: [],
  extraction_confidence: 0.98,
};

export const MOCK_TEST_FIXTURE_WORKSHOP: ExtractedAnnouncement = {
  title: '[FIXTURE] Machine Learning & AI Bootcamp',
  description: 'Hands-on workshop on generative AI architectures and fine-tuning.',
  category: 'Workshop',
  event_date: '2026-11-28',
  event_time: '14:00',
  timezone: 'Asia/Kolkata',
  venue: 'Auditorium 2',
  registration_deadline: '2026-11-25',
  registration_url: 'https://campus.edu/bootcamp',
  priority: 'upcoming',
  instructions: ['Pre-install Python 3.11', 'Create HuggingFace account'],
  missing_fields: [],
  extraction_confidence: 0.95,
};

export const MOCK_TEST_EXTRACTION_RESPONSE: ExtractionResponse = {
  announcements: [MOCK_TEST_FIXTURE_HACKATHON, MOCK_TEST_FIXTURE_WORKSHOP],
};

