# CAMPUSFLOW — University Department Event Lifecycle Platform
### Department of Computer Science & Business Systems (CSBS) & Internet of Things (IoT)
**Vignan's Foundation for Science, Technology & Research (Deemed to be University)**

---

## 🏛️ Executive Summary

**CAMPUSFLOW** is a mission-critical, full-stack digital operating system engineered specifically for the **Department of CSBS & IoT**. It manages the entire statutory lifecycle of university technical symposiums, hackathons, guest lectures, OBE-aligned workshops, and research conferences.

The platform enforces the statutory university policy: **"NO HOD APPROVAL = NO PUBLIC EVENT"**. Every event proposed by faculty or student coordinators traverses a cryptographic review queue before publication, admit pass generation, or attendance check-in.

---

## 🚀 Key Features

### 1. 🛡️ Statutory Governance & HOD Approval Queue
- **Role-Based Access Control (RBAC)**: Distinct permissions for `HOD`, `FACULTY`, `STUDENT`, and `GATE_SECURITY`.
- **Digital Signatures**: Events approved by HOD receive a cryptographically sealed digital audit hash (`SHA-256`) and statutory approval badge.
- **Bulk & Single Action Processing**: Head of Department can approve, return with revisions, or reject charters in one click.

### 2. 📝 Student Joining Form & Real-Time Attendance Roster
- **Form Link Space**: Faculty can configure external registration forms (Google Forms, Microsoft Forms, custom portal URLs) directly in the event charter.
- **Real-Time Attendance Self Check-in**: Students can input their form response/join link and confirm attendance in real-time.
- **Real-Time Attendance Counter**: Live counters in the event catalog and detail view reflect verified present attendees instantly.
- **Gate Security Check-In**: Security staff can scan student admit slips or verify registration IDs at the hall entrance.

### 3. 🎫 Student QR Admit Slips & Calendar Sync
- **Cryptographic Gate Passes**: Instant admit pass generation with unique QR verification codes, seat zone assignment, and student ID verification.
- **Calendar Integration**: One-click sync to Google Calendar, Outlook, Apple Calendar, and downloadable `.ics` format.

### 4. 🌙 University-Grade Dark & Light Mode
- High-contrast, WCAG AA compliant theme switching with persistent localStorage state.

### 5. 🤖 CampusFlow AI Virtual Assistant
- Natural language university co-pilot powered by Google Gemini API to draft event charters, suggest syllabus mappings, and guide attendees.

---

## 🏗️ Technical Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti
- **Backend**: Node.js, Express, TypeScript (`tsx` in dev, bundled with `esbuild` for production)
- **Database**: In-memory persistent high-speed store with bidirectional Supabase PostgreSQL cloud synchronization
- **Authentication**: Bearer Token / Role-enforced JWT and statutory headers (`x-user-role`, `x-user-id`)
- **Containerization**: Cloud Run ready, configured to bind `0.0.0.0:3000`

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd campusflow-csbs-iot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and provide your credentials:
```bash
cp .env.example .env
```

Required variables:
```env
# Gemini API Key for CampusFlow AI Copilot
GEMINI_API_KEY="your-gemini-api-key"

# Supabase Database (Optional for Cloud Sync)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# JWT Secret for Session Verification
JWT_SECRET="your-secure-random-secret"
```

### 3. Start Development Server
```bash
npm run dev
```
The application will boot on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 👥 Default Institutional Personas

| Persona | Role | Identifier | Department |
| :--- | :--- | :--- | :--- |
| **Dr. K. Venkata Rao** | `HOD` | `HOD-CSBS-01` | CSBS & IoT |
| **Dr. Sarah Jenkins** | `FACULTY` | `FAC-CSBS-042` | CSBS & IoT |
| **Prof. Rajesh Sharma** | `FACULTY` | `FAC-IOT-019` | CSBS & IoT |
| **Aarav Patel** | `STUDENT` | `221FA04001` | CSBS 3rd Year |
| **Suresh Kumar** | `GATE_SECURITY` | `SEC-MAIN-04` | Campus Security |

---

## 📤 Pushing to Your GitHub Repository

To push this codebase to your own GitHub repository:

```bash
# Initialize git if not already initialized
git init

# Stage all production files
git add .

# Commit changes
git commit -m "feat: complete production-ready CAMPUSFLOW platform for CSBS & IoT"

# Set your default branch to main
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Push to GitHub
git push -u origin main
```

---

## 📜 License
Internal institutional software for **Vignan's Foundation for Science, Technology & Research**. All rights reserved.
