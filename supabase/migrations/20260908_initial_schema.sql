-- ==========================================================
-- CAMPUSFLOW — Vignan University
-- The Digital Operating System for Department Activities
-- Production PostgreSQL & Supabase Database Migration
-- Core Rule: NO HOD APPROVAL = NO PUBLIC EVENT
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'HOD')),
    department_id UUID,
    department_name TEXT DEFAULT 'Department of Computer Science & Engineering',
    identifier TEXT, -- Student Roll No (e.g. 221FA04001) or Faculty ID (e.g. VUG-FAC-041)
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    hod_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Foreign key link back to departments
ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_department 
    FOREIGN KEY (department_id) 
    REFERENCES public.departments(id) 
    ON DELETE SET NULL;

-- 3. EVENTS TABLE (Core Event Lifecycle Table)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    department_name TEXT NOT NULL DEFAULT 'Department of Computer Science & Engineering',
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Workshop', 'Seminar', 'Hackathon', 'Competition', 
        'Guest Lecture', 'Technical Event', 'Cultural Event', 'Research Event', 'Other'
    )),
    event_type TEXT NOT NULL CHECK (event_type IN ('Offline', 'Online', 'Hybrid')),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    location_details TEXT,
    online_link TEXT,
    poster_url TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
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
        'REGISTRATION_CLOSED', 
        'COMPLETED', 
        'CANCELLED'
    )),
    academic_credits NUMERIC(3, 1) DEFAULT 2.0,
    syllabus_mapping TEXT,
    hod_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    hod_review_comment TEXT,
    digital_signature_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMPTZ
);

-- 4. EVENT AGENDA TABLE
CREATE TABLE IF NOT EXISTS public.event_agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    designation TEXT,
    organization TEXT,
    bio TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. EVENT REGISTRATIONS TABLE
-- Critical constraint: UNIQUE(event_id, student_id) prevents duplicate registrations!
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_id TEXT UNIQUE NOT NULL, -- e.g. VUG-2026-8841-ALX
    seat_zone TEXT DEFAULT 'General Admission Zone A',
    qr_code_data TEXT NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    registration_status TEXT DEFAULT 'CONFIRMED' CHECK (registration_status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLED')),
    checked_in_at TIMESTAMPTZ,
    CONSTRAINT unique_event_student_registration UNIQUE (event_id, student_id)
);

-- 7. EVENT APPROVALS (Permanent Statutory Audit Trail)
CREATE TABLE IF NOT EXISTS public.event_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN (
        'SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'PUBLISHED'
    )),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'action_required')),
    related_event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. AUDIT LOGS (Institutional Governance Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
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

-- Profiles: Anyone can view names/roles; users can update their own profile
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Departments: Readable by all
CREATE POLICY "Departments are viewable by all"
    ON public.departments FOR SELECT
    TO authenticated, anon
    USING (true);

-- Events: 
-- 1. Anyone (including unauthenticated/anon) can view ONLY PUBLISHED events
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    TO anon, authenticated
    USING (status = 'PUBLISHED' OR status = 'REGISTRATION_CLOSED' OR status = 'COMPLETED');

-- 2. Faculty can view all their own events (including DRAFT, PENDING_REVIEW, CHANGES_REQUESTED)
CREATE POLICY "Faculty can view their own events"
    ON public.events FOR SELECT
    TO authenticated
    USING (organizer_id = auth.uid());

-- 3. HOD can view all events belonging to their department
CREATE POLICY "HOD can view department events"
    ON public.events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'HOD' 
            AND profiles.department_id = events.department_id
        )
    );

-- 4. Only Faculty can insert new events as DRAFT or PENDING_REVIEW
CREATE POLICY "Faculty can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        organizer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'FACULTY'
        )
    );

-- 5. Faculty can update their own events ONLY IF status is DRAFT or CHANGES_REQUESTED
CREATE POLICY "Faculty can update their own draft events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        organizer_id = auth.uid() AND
        (status = 'DRAFT' OR status = 'CHANGES_REQUESTED')
    );

-- 6. Only HOD can approve or publish events (Faculty CANNOT publish directly!)
CREATE POLICY "Only HOD can update status to APPROVED or PUBLISHED"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'HOD'
        )
    );

-- Registrations RLS:
-- Students can see their own registrations
CREATE POLICY "Students can view own registrations"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

-- Organizers and HODs can view participants for their events
CREATE POLICY "Organizers and HODs can view event registrations"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_registrations.event_id
            AND (
                events.organizer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'HOD'
                )
            )
        )
    );

-- Students can insert their own registration
CREATE POLICY "Students can register for published events"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_id AND events.status = 'PUBLISHED'
        )
    );

-- Notifications RLS:
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- ==========================================================
-- STORAGE BUCKETS SETUP
-- ==========================================================
-- Run in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-posters', 'event-posters', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('speaker-photos', 'speaker-photos', true) ON CONFLICT DO NOTHING;
