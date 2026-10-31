export type UserRole = 'student' | 'campus_admin';

export type AnnouncementCategory =
  | 'Academic'
  | 'Hackathon'
  | 'Workshop'
  | 'Cultural'
  | 'Sports'
  | 'Placement'
  | 'Administrative'
  | 'General';

export type AnnouncementPriority = 'urgent' | 'upcoming' | 'expired';

export type AnnouncementStatus = 'published' | 'draft' | 'archived';

export type ExtractionStatus = 'verified' | 'needs_review' | 'manual';

export interface Campus {
  id: string;
  name: string;
  code: string;
  slug: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  campus_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampusMember {
  id: string;
  campus_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
}

export interface Announcement {
  id: string;
  campus_id: string;
  created_by: string;
  title: string;
  description: string;
  original_text: string | null;
  category: AnnouncementCategory;
  event_date: string | null;
  event_time: string | null;
  timezone: string;
  venue: string | null;
  registration_deadline: string | null;
  registration_url: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  instructions: string[];
  missing_fields: string[];
  extraction_confidence: number | null;
  extraction_status: ExtractionStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementSource {
  id: string;
  announcement_id: string | null;
  submitted_by: string;
  campus_id: string;
  raw_text: string;
  input_length: number;
  extraction_status: ExtractionStatus;
  ai_model_used: string | null;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_campus_id: string | null;
  email_notifications_enabled: boolean;
  reminder_days_before: number;
  urgent_window_hours: number;
  preferred_categories: AnnouncementCategory[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

