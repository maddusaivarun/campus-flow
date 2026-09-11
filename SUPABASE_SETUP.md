# CAMPUSFLOW — Vignan University
## Supabase Production Setup & Deployment Guide

This guide walks you through connecting CAMPUSFLOW to your real Supabase project with PostgreSQL, Supabase Auth, Row Level Security (RLS), and Storage.

---

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and navigate to the dashboard.
2. Click **New Project**.
3. Choose an organization, enter the project name: `CAMPUSFLOW-Vignan`, set a strong database password, and select your preferred region (e.g. `ap-south-1` Mumbai).
4. Wait ~2 minutes for the database to provision.

---

### 2. Configure Database Schema & RLS Policies
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Copy the entire contents of `supabase/migrations/20260908_initial_schema.sql`.
4. Click **Run**.
5. All 9 relational tables (`profiles`, `departments`, `events`, `event_agenda`, `event_speakers`, `event_registrations`, `event_approvals`, `notifications`, `audit_logs`), indexes, and Row Level Security policies will be created instantly.

---

### 3. Configure Supabase Storage
1. Navigate to **Storage** in the Supabase Dashboard.
2. Click **New Bucket**:
   - Bucket Name: `event-posters` (Public: Enabled)
   - Bucket Name: `speaker-photos` (Public: Enabled)
3. Set file size limit to 5MB and allowed MIME types: `image/jpeg, image/png, image/webp`.

---

### 4. Configure Environment Variables
In your deployment environment or `.env` file, configure the following keys from your Supabase Project Settings (**Project Settings -> API**):

```env
# Supabase API URL
SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Public Anonymous Key (safe for browser)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Service Role Secret Key (Server-side ONLY - Never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# JWT Secret for session signing
JWT_SECRET=your-secure-random-secret-key-32-chars-long
```

---

### 5. Initial Accounts & Role Assignment
The application includes a database-driven user profile system with three roles:
- **HOD** (`HOD`): Full statutory review, approve & publish, reject, request changes, view department rosters.
  - Default: `hod.cse@vignan.ac.in` (Dr. Eleanor Vance, Head of Department)
- **FACULTY** (`FACULTY`): Create event charters, save drafts, submit for HOD review, view feedback, manage rosters.
  - Default: `faculty.rajesh@vignan.ac.in` (Prof. Rajesh K. Sharma, Associate Professor)
- **STUDENT** (`STUDENT`): Discover published events, one-click registration, digital QR gate pass, view my passes.
  - Default: `student.varun@vignan.ac.in` (Varun Maddu, Roll: 221FA04001)

You can also sign up new accounts directly from the application UI, where users choose their role and department during registration.

---

### 6. End-to-End Workflow Verification
1. **Faculty Sign-In**:
   - Log in as Faculty (`faculty.rajesh@vignan.ac.in`).
   - Click **Draft New Charter**, fill in event details or use the **AI Copilot**, and click **Submit for HOD Sign-Off**.
   - Note that the event status becomes `PENDING_REVIEW` and is **NOT** visible on the public portal.
2. **HOD Statutory Clearance**:
   - Log in as HOD (`hod.cse@vignan.ac.in`).
   - Open **Approval Center**, view the pending proposal and automated venue conflict check.
   - Click **Approve & Publish**. A cryptographic digital signature is stamped, and status becomes `PUBLISHED`.
3. **Student Discovery & Gate Admission**:
   - Log in as Student (`student.varun@vignan.ac.in`).
   - Navigate to the Public Event Portal. The newly published event is now visible.
   - Click **Register Now**. A verified registration record with unique pass ID and QR code is created.
   - Open **Gate Scanner**, scan or type the student's pass ID, and verify the student is admitted to the venue.
