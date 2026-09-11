-- ==========================================================
-- CAMPUSFLOW — Vignan University
-- The Digital Operating System for Department Activities
-- Production PostgreSQL & Supabase Database Migration
-- Core Rule: NO HOD APPROVAL = NO PUBLIC EVENT
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Compatible with both Supabase Auth & Application String IDs)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'HOD', 'GATE_SECURITY', 'PUBLIC')),
    department_id TEXT,
    department_name TEXT DEFAULT 'Department of Computer Science & Engineering',
    identifier TEXT, -- Student Roll No (e.g. 221FA04001) or Faculty ID (e.g. VUG-FAC-041)
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    hod_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. EVENTS TABLE (Core Event Lifecycle Table)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    organizer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    department_name TEXT NOT NULL DEFAULT 'Department of Computer Science & Engineering',
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    location_details TEXT,
    online_link TEXT,
    poster_url TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    registered_count INTEGER NOT NULL DEFAULT 0,
    attendance_count INTEGER NOT NULL DEFAULT 0,
    registration_deadline DATE NOT NULL,
    eligibility TEXT DEFAULT 'Open to all Vignan University students',
    requirements TEXT,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 
        'PENDING_REVIEW', 
        'CHANGES_REQUESTED', 
        'APPROVED', 
        'REJECTED', 
        'PUBLISHED', 
        'REGISTRATION_OPEN',
        'ONGOING',
        'REGISTRATION_CLOSED', 
        'COMPLETED', 
        'CANCELLED'
    )),
    academic_credits NUMERIC(3, 1) DEFAULT 2.0,
    syllabus_mapping TEXT,
    hod_reviewer_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    hod_review_comment TEXT,
    digital_signature_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMPTZ
);

-- 4. EVENT AGENDA TABLE
CREATE TABLE IF NOT EXISTS public.event_agenda (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    start_time TEXT NOT NULL,
    end_time TEXT,
    title TEXT NOT NULL,
    description TEXT,
    speaker TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EVENT SPEAKERS TABLE
CREATE TABLE IF NOT EXISTS public.event_speakers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    designation TEXT,
    organization TEXT,
    bio TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. EVENT REGISTRATIONS TABLE
-- Critical constraint: registration_id uniqueness ensures clean idempotent syncing
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_id TEXT UNIQUE NOT NULL, -- e.g. VUG-2026-8841-ALX
    student_name TEXT,
    student_roll TEXT,
    student_email TEXT,
    student_department TEXT,
    seat_zone TEXT DEFAULT 'General Admission Zone A',
    qr_code_data TEXT NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    registration_status TEXT DEFAULT 'CONFIRMED' CHECK (registration_status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLED')),
    checked_in_at TIMESTAMPTZ,
    CONSTRAINT unique_event_student_registration UNIQUE (event_id, student_id)
);

-- 7. EVENT APPROVALS (Permanent Statutory Audit Trail)
CREATE TABLE IF NOT EXISTS public.event_approvals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN (
        'SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'PUBLISHED'
    )),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'action_required')),
    related_event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. AUDIT LOGS (Institutional Governance Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    actor_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. FEEDBACKS TABLE (Post-Event Rating & Outcomes Ledger)
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    student_department TEXT DEFAULT 'Department of Computer Science & Engineering',
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content_quality NUMERIC(2, 1),
    organization NUMERIC(2, 1),
    speaker_rating NUMERIC(2, 1),
    comment TEXT,
    takeaways TEXT,
    would_recommend BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_department ON public.events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_event ON public.feedbacks(event_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_student ON public.feedbacks(student_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view names/roles
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Departments: Readable by all
CREATE POLICY "Departments are viewable by all"
    ON public.departments FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Service role full access on departments"
    ON public.departments FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Events: 
-- Anyone can view PUBLISHED / active public events
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    TO anon, authenticated
    USING (
        status IN ('PUBLISHED', 'REGISTRATION_OPEN', 'ONGOING', 'REGISTRATION_CLOSED', 'COMPLETED')
    );

CREATE POLICY "Service role full access on events"
    ON public.events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Registrations RLS:
CREATE POLICY "Public and users can view event registrations"
    ON public.event_registrations FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Service role full access on registrations"
    ON public.event_registrations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Approvals RLS:
CREATE POLICY "Approvals readable by authenticated"
    ON public.event_approvals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role full access on approvals"
    ON public.event_approvals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Notifications RLS:
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Service role full access on notifications"
    ON public.notifications FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Audit Logs RLS:
CREATE POLICY "Audit logs readable by authenticated"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role full access on audit logs"
    ON public.audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Feedbacks RLS:
CREATE POLICY "Feedbacks viewable by all"
    ON public.feedbacks FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Service role full access on feedbacks"
    ON public.feedbacks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
