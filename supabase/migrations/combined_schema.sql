-- =============================================================================
-- CAMPUS PULSE - COMPLETE DATABASE MIGRATION SCRIPT
-- Paste this script into your Supabase Dashboard -> SQL Editor and click RUN.
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'campus_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_category AS ENUM (
    'Academic', 'Hackathon', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Administrative', 'General'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_priority AS ENUM ('urgent', 'upcoming', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_status AS ENUM ('published', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE extraction_status AS ENUM ('verified', 'needs_review', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. TABLES
CREATE TABLE IF NOT EXISTS public.campuses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  domain      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'student',
  campus_id   UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campus_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id   UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'student',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campus_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id               UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  created_by              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL DEFAULT '',
  original_text           TEXT,
  category                announcement_category NOT NULL DEFAULT 'General',
  event_date              DATE,
  event_time              TIME,
  timezone                TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  venue                   TEXT,
  registration_deadline   TIMESTAMPTZ,
  registration_url        TEXT,
  priority                announcement_priority NOT NULL DEFAULT 'upcoming',
  status                  announcement_status NOT NULL DEFAULT 'published',
  instructions            TEXT[] NOT NULL DEFAULT '{}',
  missing_fields          TEXT[] NOT NULL DEFAULT '{}',
  extraction_confidence   FLOAT,
  extraction_status       extraction_status NOT NULL DEFAULT 'manual',
  is_verified             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcement_sources (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id     UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  submitted_by        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campus_id           UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  raw_text            TEXT NOT NULL,
  input_length        INT NOT NULL,
  extraction_status   extraction_status NOT NULL DEFAULT 'manual',
  ai_model_used       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_campus_id           UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_days_before        INT NOT NULL DEFAULT 3,
  urgent_window_hours         INT NOT NULL DEFAULT 24,
  preferred_categories        announcement_category[] NOT NULL DEFAULT '{}',
  timezone                    TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_campuses_slug ON public.campuses (slug);
CREATE INDEX IF NOT EXISTS idx_profiles_campus_id ON public.profiles (campus_id);
CREATE INDEX IF NOT EXISTS idx_campus_members_user ON public.campus_members (user_id);
CREATE INDEX IF NOT EXISTS idx_campus_members_campus ON public.campus_members (campus_id);
CREATE INDEX IF NOT EXISTS idx_announcements_campus ON public.announcements (campus_id);
CREATE INDEX IF NOT EXISTS idx_announcements_event_date ON public.announcements (event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_deadline ON public.announcements (registration_deadline);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements (priority);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements (status);

-- 5. RLS ENABLEMENT
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.auth_user_campus_id()
RETURNS UUID AS $$
  SELECT campus_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_campus_admin(p_campus_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campus_members
    WHERE campus_id = p_campus_id
      AND user_id = auth.uid()
      AND role = 'campus_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_campus_member(p_campus_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campus_members
    WHERE campus_id = p_campus_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 7. RLS POLICIES
DROP POLICY IF EXISTS "campuses_select_authenticated" ON public.campuses;
CREATE POLICY "campuses_select_authenticated" ON public.campuses FOR SELECT TO authenticated USING (is_active = TRUE);

DROP POLICY IF EXISTS "campuses_select_anon" ON public.campuses;
CREATE POLICY "campuses_select_anon" ON public.campuses FOR SELECT TO anon USING (is_active = TRUE);

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_same_campus" ON public.profiles;
CREATE POLICY "profiles_select_same_campus" ON public.profiles FOR SELECT TO authenticated USING (
  campus_id IS NOT NULL AND campus_id = public.auth_user_campus_id()
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "campus_members_select" ON public.campus_members;
CREATE POLICY "campus_members_select" ON public.campus_members FOR SELECT TO authenticated USING (public.is_campus_member(campus_id));

DROP POLICY IF EXISTS "campus_members_insert_self" ON public.campus_members;
CREATE POLICY "campus_members_insert_self" ON public.campus_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "announcements_select_campus_member" ON public.announcements;
CREATE POLICY "announcements_select_campus_member" ON public.announcements FOR SELECT TO authenticated USING (
  public.is_campus_member(campus_id) AND status = 'published'
);

DROP POLICY IF EXISTS "announcements_select_own_draft" ON public.announcements;
CREATE POLICY "announcements_select_own_draft" ON public.announcements FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (
  public.is_campus_member(campus_id) AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "announcements_update_own" ON public.announcements;
CREATE POLICY "announcements_update_own" ON public.announcements FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "announcements_update_admin" ON public.announcements;
CREATE POLICY "announcements_update_admin" ON public.announcements FOR UPDATE TO authenticated USING (public.is_campus_admin(campus_id)) WITH CHECK (public.is_campus_admin(campus_id));

DROP POLICY IF EXISTS "announcements_delete_own" ON public.announcements;
CREATE POLICY "announcements_delete_own" ON public.announcements FOR DELETE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "announcements_delete_admin" ON public.announcements;
CREATE POLICY "announcements_delete_admin" ON public.announcements FOR DELETE TO authenticated USING (public.is_campus_admin(campus_id));

DROP POLICY IF EXISTS "user_preferences_all_own" ON public.user_preferences;
CREATE POLICY "user_preferences_all_own" ON public.user_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 8. AUTH TRIGGER (Auto-create profile when user signs up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. DEFAULT SEED CAMPUS (Safe insert)
INSERT INTO public.campuses (id, name, code, slug, domain, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'MIT Academy of Engineering',
  'MITAOE',
  'mitaoe',
  'mitaoe.ac.in',
  TRUE
)
ON CONFLICT (code) DO NOTHING;

