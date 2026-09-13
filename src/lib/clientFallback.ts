import { DepartmentEvent, EventCategory, UserProfile, RegistrationRecord, FeedbackRecord, EventFeedbackMetrics } from '../types';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS } from '../data/seedData';

/**
 * Safely fetches JSON from an endpoint.
 * If the host is a static host (like Netlify without a running Node backend) that returns
 * an HTML file (e.g. index.html from SPA redirect), this returns null instead of throwing
 * "SyntaxError: Unexpected token '<', '<!doctype '... is not valid JSON".
 */
export async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return null;
    }

    return JSON.parse(text) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Client-Side AI Copilot for event charters.
 * Generates structured, accredited activity proposals directly in the browser when
 * deployed on static hosts or when Gemini backend is offline.
 */
export function generateClientCharterSuggestion(prompt: string, departmentName: string) {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  let title = 'Technical Immersion & Industry Practice Workshop';
  let category: EventCategory = 'Workshop';
  let eventType = 'Hands-on Prototyping Workshop';
  let credits = 2.0;
  let syllabus = `${departmentName}: Module 4 Outcome-Based Education Aligned`;

  if (lower.includes('ai') || lower.includes('llm') || lower.includes('gpt') || lower.includes('machine learning') || lower.includes('generative')) {
    title = 'Generative AI & Autonomous Agentic Engineering';
    category = 'Workshop';
    eventType = 'Applied AI Prototyping Workshop';
    credits = 2.5;
    syllabus = 'CSBS-AI-801: Transformer Architectures & Vector Database Pipelines';
  } else if (lower.includes('cloud') || lower.includes('devops') || lower.includes('docker') || lower.includes('kubernetes')) {
    title = 'Cloud Native Microservices & Kubernetes Deployment';
    category = 'Technical';
    eventType = 'Production Cloud Infrastructure Bootcamp';
    credits = 3.0;
    syllabus = 'CSBS-CLD-902: Container Isolation, Ingress Routing & Cluster Health';
  } else if (lower.includes('cyber') || lower.includes('security') || lower.includes('defense') || lower.includes('ethical')) {
    title = 'Enterprise Cybersecurity & Zero Trust Defense Lab';
    category = 'Hackathon';
    eventType = 'Red/Blue Team Security Simulation';
    credits = 2.0;
    syllabus = 'CSBS-CYB-704: Cryptographic Key Management & Threat Mitigation';
  } else if (lower.includes('iot') || lower.includes('embedded') || lower.includes('sensor') || lower.includes('robotics')) {
    title = 'Industrial IoT & Smart Edge Sensor Prototyping';
    category = 'Workshop';
    eventType = 'Embedded Hardware Prototyping Workshop';
    credits = 2.0;
    syllabus = 'CSBS-IOT-601: Microcontroller Interfacing & Telemetry Protocols';
  } else if (lower.includes('seminar') || lower.includes('talk') || lower.includes('lecture') || lower.includes('keynote')) {
    title = 'Distinguished Academic Colloquium: Tech Innovations';
    category = 'Seminar';
    eventType = 'Invited Industry Expert Seminar';
    credits = 1.0;
    syllabus = 'CSBS-SEM-101: Emerging Paradigms in Computing & Industry Standards';
  } else if (lower.includes('hack') || lower.includes('code') || lower.includes('competition')) {
    title = '24-Hour Campus Innovation Hackathon';
    category = 'Hackathon';
    eventType = 'Rapid Prototyping Competition';
    credits = 3.0;
    syllabus = 'CSBS-HACK-501: Multi-Disciplinary Agile Solution Engineering';
  } else {
    // Generate clean capitalized title from user prompt
    const cleanWords = p.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).slice(0, 6);
    if (cleanWords.length > 0) {
      title = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + ' Workshop';
    }
  }

  return {
    title,
    shortDescription: `Curriculum-aligned intensive training on ${title.toLowerCase()} for undergraduate students.`,
    description: `An outcome-based technical immersion designed to bridge academic syllabus with enterprise standards. Undergraduates will explore core conceptual models, implement practical exercises in lab sandboxes, and receive certified OBE academic credits upon verified gate attendance.`,
    category,
    eventType,
    syllabusMapping: syllabus,
    academicCredits: credits,
    objectives: [
      `Master core technical architectures and verify implementation in sandboxed lab environments.`,
      `Implement production-grade code artifacts adhering to university and industry standards.`,
      `Demonstrate alignment with accredited Department Course Outcomes (COs) and Program Outcomes (POs).`
    ],
    agenda: [
      {
        id: 'ag-1',
        time: '09:30 AM - 10:45 AM',
        sessionTitle: 'Foundational Theory & Architecture Walkthrough',
        description: 'Deep dive into fundamental algorithms, data models, and system requirements.',
        durationMinutes: 75
      },
      {
        id: 'ag-2',
        time: '11:00 AM - 01:00 PM',
        sessionTitle: 'Hands-on Implementation Sandbox Lab',
        description: 'Supervised lab session building and evaluating practical working prototypes.',
        durationMinutes: 120
      }
    ],
    requirements: {
      prerequisites: 'Basic programming literacy, familiarity with data structures, active university ID.',
      thingsToBring: 'Personal laptop with charger, institutional ID card for gate scanner check-in.',
      softwareTools: 'Modern web browser, VS Code or Cursor IDE, Git, and Python/Node.js runtime.'
    }
  };
}

/**
 * Client-Side Intelligent CampusFlow Virtual Assistant.
 * Provides instant real-time answers about events, countdowns, schedules, admit slips,
 * HOD governance, and all portal views directly in the browser.
 */
export function generateClientAssistantReply(
  query: string,
  events: DepartmentEvent[],
  activeView?: string
): string {
  const lower = query.toLowerCase().trim();
  const allEvents = events && events.length > 0 ? events : [];

  // Summary of active events with live countdown calculation
  const now = new Date().getTime();
  const eventsSummary = allEvents.map((e) => {
    let countdown = 'Scheduled';
    try {
      const eventTime = new Date(`${e.date}T${e.startTime || '09:00'}:00`).getTime();
      const diff = eventTime - now;
      if (diff <= 0) {
        countdown = 'Live / Happening Today';
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        countdown = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
      }
    } catch {}
    return { id: e.id, title: e.title, countdown };
  });

  // Intelligent event search scoring
  const scoreEvent = (e: DepartmentEvent): number => {
    let score = 0;
    const titleLower = e.title.toLowerCase();
    const descLower = (e.description || '').toLowerCase();
    const shortDescLower = (e.shortDescription || '').toLowerCase();
    const venueLower = (e.venue || '').toLowerCase();
    const speakerLower = (e.speaker?.name || '').toLowerCase();
    const categoryLower = (e.category || '').toLowerCase();

    // Direct title or id match
    if (lower.includes(e.id.toLowerCase())) score += 50;
    if (lower.includes(titleLower)) score += 40;

    // Domain keywords
    if ((lower.includes('ai') || lower.includes('genai') || lower.includes('llm') || lower.includes('prompt') || lower.includes('langgraph') || lower.includes('rag')) &&
        (titleLower.includes('ai') || titleLower.includes('genai') || titleLower.includes('llm'))) score += 30;

    if ((lower.includes('microservice') || lower.includes('cloud') || lower.includes('kubernetes') || lower.includes('k8s') || lower.includes('docker') || lower.includes('container')) &&
        (titleLower.includes('cloud') || titleLower.includes('microservice'))) score += 30;

    if ((lower.includes('hack') || lower.includes('hackathon') || lower.includes('campus hack') || lower.includes('acm')) &&
        (titleLower.includes('hackathon') || titleLower.includes('acm'))) score += 30;

    if ((lower.includes('database') || lower.includes('cockroach') || lower.includes('raft') || lower.includes('sql') || lower.includes('distributed db')) &&
        (titleLower.includes('database') || descLower.includes('database'))) score += 30;

    if ((lower.includes('competitive') || lower.includes('algo') || lower.includes('coding league') || lower.includes('dp')) &&
        (titleLower.includes('competitive') || titleLower.includes('programming'))) score += 30;

    // Check title words
    const titleWords = titleLower.split(/[\s\-:&]+/).filter((w) => w.length >= 3);
    for (const tw of titleWords) {
      if (lower.includes(tw)) score += 10;
    }

    // Check speaker
    if (speakerLower && lower.includes(speakerLower)) score += 25;
    if (e.speaker?.name) {
      const spkWords = speakerLower.split(/\s+/).filter((w) => w.length >= 4);
      for (const sw of spkWords) {
        if (lower.includes(sw)) score += 15;
      }
    }

    // Check venue
    if (venueLower && lower.includes(venueLower)) score += 20;

    // Check category
    if (categoryLower && lower.includes(categoryLower)) score += 5;

    return score;
  };

  const rankedEvents = allEvents
    .map((e) => ({ event: e, score: scoreEvent(e) }))
    .filter((item) => item.score > 15)
    .sort((a, b) => b.score - a.score);

  const bestMatch = rankedEvents.length > 0 ? rankedEvents[0].event : null;

  // 1. SPECIFIC EVENT INQUIRY (matched an individual event)
  if (bestMatch) {
    const item = eventsSummary.find((s) => s.id === bestMatch.id);
    const seatsRemaining = Math.max(0, bestMatch.capacity - (bestMatch.registeredCount || 0));

    // If query asks specifically about who is speaking / speaker
    if (lower.includes('speaker') || lower.includes('who is') || lower.includes('instructor') || lower.includes('convenor') || lower.includes('faculty') || lower.includes('coordinator')) {
      return (
        `👤 **Speaker & Organizer Details for "${bestMatch.title}"**:\n\n` +
        `• **Speaker**: ${bestMatch.speaker?.name || 'Department Faculty Coordinator'}\n` +
        `• **Designation**: ${bestMatch.speaker?.designation || bestMatch.organizerDesignation || 'Faculty Specialist'}\n` +
        `• **Organization**: ${bestMatch.speaker?.organization || 'Department of CSBS & IoT'}\n` +
        `• **Biography**: ${bestMatch.speaker?.bio || 'Distinguished academic and industry practitioner.'}\n` +
        `• **Faculty Convenor**: ${bestMatch.organizerName} (${bestMatch.organizerContact})\n\n` +
        `📅 Date: ${bestMatch.date} (${bestMatch.startTime} - ${bestMatch.endTime}) | 📍 Venue: ${bestMatch.venue}`
      );
    }

    // If query asks specifically about venue / location
    if (lower.includes('venue') || lower.includes('where') || lower.includes('location') || lower.includes('hall') || lower.includes('room')) {
      return (
        `📍 **Venue & Location for "${bestMatch.title}"**:\n\n` +
        `• **Primary Venue**: ${bestMatch.venue}\n` +
        `• **Location Details**: ${bestMatch.locationDetails || 'Main Academic Complex'}\n` +
        `• **Department**: ${bestMatch.departmentName || 'Department of CSBS & IoT'}\n` +
        `• **Seat Capacity**: ${bestMatch.capacity} seats (${seatsRemaining} remaining)\n\n` +
        `⏰ Scheduled Time: ${bestMatch.date} from ${bestMatch.startTime} to ${bestMatch.endTime}.\n` +
        `Gate check-in opens 30 minutes before the scheduled start time.`
      );
    }

    // If query asks specifically about timing / schedule / date / countdown
    if (lower.includes('when') || lower.includes('date') || lower.includes('time') || lower.includes('countdown') || lower.includes('schedule') || lower.includes('starts')) {
      return (
        `📅 **Schedule & Countdown for "${bestMatch.title}"**:\n\n` +
        `• **Date**: ${bestMatch.date}\n` +
        `• **Time**: ${bestMatch.startTime} - ${bestMatch.endTime}\n` +
        `• **Live Countdown**: ⏳ **${item?.countdown || 'Scheduled'}**\n` +
        `• **Venue**: 📍 ${bestMatch.venue}\n` +
        `• **Registration Deadline**: ⏰ ${bestMatch.registrationDeadline || bestMatch.date}\n\n` +
        `You can add this event directly to your Google Calendar or Microsoft Outlook from the **Events Calendar** tab!`
      );
    }

    // If query asks specifically about registration / eligibility / prerequisites / seats
    if (lower.includes('register') || lower.includes('seats') || lower.includes('prerequisite') || lower.includes('eligibility') || lower.includes('how to join') || lower.includes('capacity')) {
      return (
        `🎫 **Registration & Eligibility for "${bestMatch.title}"**:\n\n` +
        `• **Seats Availability**: 👥 ${bestMatch.registeredCount}/${bestMatch.capacity} confirmed (${seatsRemaining} seats left)\n` +
        `• **Target Audience**: ${bestMatch.targetAudience || 'All B.Tech CSBS & IoT Students'}\n` +
        `• **Eligibility**: ${bestMatch.eligibility || 'Open to registered university students'}\n` +
        `• **Prerequisites**: ${bestMatch.requirements?.prerequisites || 'Basic foundational programming knowledge'}\n` +
        `• **Required Software/Tools**: ${bestMatch.requirements?.softwareTools || 'Laptop with browser and development tools'}\n` +
        `• **Things to Bring**: ${bestMatch.requirements?.thingsToBring || 'Personal laptop and institutional ID card'}\n\n` +
        `To claim your seat: Click **"Claim Admit Slip"** in the Public Catalog, or switch to your student account to generate your official pass!`
      );
    }

    // Default full event dossier
    return (
      `Here are the official verified details for **${bestMatch.title}**:\n\n` +
      `• **Category**: ${bestMatch.category} (${bestMatch.eventType})\n` +
      `• **Status**: ${bestMatch.status === 'PUBLISHED' ? '✅ Approved by HOD & Open for Registration' : bestMatch.status}\n` +
      `• **Live Countdown**: ⏳ **${item?.countdown || 'Scheduled'}**\n` +
      `• **Date & Schedule**: 📅 ${bestMatch.date} | ⏰ ${bestMatch.startTime} - ${bestMatch.endTime}\n` +
      `• **Venue**: 📍 ${bestMatch.venue} (${bestMatch.locationDetails || 'Campus Complex'})\n` +
      `• **Speaker / Lead**: 👤 ${bestMatch.speaker?.name || bestMatch.organizerName} (${bestMatch.speaker?.organization || 'Vignan'})\n` +
      `• **OBE Academic Credits**: 🎓 ${bestMatch.academicCredits || 2.0} Credits (${bestMatch.syllabusMapping || 'Outcome Aligned'})\n` +
      `• **Seat Allocation**: 👥 ${bestMatch.registeredCount}/${bestMatch.capacity} seats filled (${seatsRemaining} remaining)\n` +
      `• **Description**: ${bestMatch.description}\n\n` +
      `You can register in the **Public Catalog** to claim your official student QR admit slip immediately!`
    );
  }

  // 2. VENUES DIRECTORY INQUIRY
  if (lower.includes('venue') || lower.includes('locations') || lower.includes('where are events') || lower.includes('auditorium') || lower.includes('seminar hall')) {
    const published = allEvents.filter((e) => e.status === 'PUBLISHED');
    return (
      `🏛️ **Official Venues for Department Activities**:\n\n` +
      published.map((e) => `• **${e.venue}**: Hosting "${e.title}" on ${e.date} (${e.locationDetails || 'Main Campus'})`).join('\n') +
      `\n\nAll venues feature designated seating zones, projector systems, high-speed Wi-Fi, and real-time gate security QR check-in.`
    );
  }

  // 3. SPEAKERS & FACULTY INQUIRY
  if (lower.includes('speaker') || lower.includes('faculty') || lower.includes('coordinators') || lower.includes('instructors') || lower.includes('who is teaching')) {
    const published = allEvents.filter((e) => e.status === 'PUBLISHED');
    return (
      `👥 **Distinguished Speakers & Faculty Convenors**:\n\n` +
      published.map((e) => `• **${e.speaker?.name || e.organizerName}** (${e.speaker?.organization || 'Vignan Faculty'})\n  Event: "${e.title}" | 📍 ${e.venue}`).join('\n\n') +
      `\n\nYou can click on any event card to view full speaker biographies and session agenda!`
    );
  }

  // 4. COUNTDOWN TIMERS
  if (lower.includes('countdown') || lower.includes('timer') || lower.includes('when does') || lower.includes('starts next') || lower.includes('how long')) {
    const published = allEvents.filter((e) => e.status === 'PUBLISHED');
    if (published.length === 0) {
      return `Currently, there are no upcoming published events waiting on the page. New event charters can be proposed by faculty and approved by the HOD!`;
    }
    return (
      `⏳ **Real-Time Countdown Timers for Department Events**:\n\n` +
      published
        .map((e) => {
          const item = eventsSummary.find((s) => s.id === e.id);
          return `• **${e.title}**\n  ⏳ **${item?.countdown || 'Active'}** | 📅 ${e.date} (${e.startTime} - ${e.endTime})\n  📍 ${e.venue} | 👥 ${e.registeredCount}/${e.capacity} seats filled`;
        })
        .join('\n\n') +
      `\n\nEvery event card displays a dynamic ticking clock showing days, hours, minutes, and seconds!`
    );
  }

  // 5. GENERAL EVENTS LIST / WORKSHOPS
  if (lower.includes('event') || lower.includes('workshop') || lower.includes('what is happening') || lower.includes('upcoming') || lower.includes('present') || lower.includes('list') || lower.includes('all')) {
    const published = allEvents.filter((e) => e.status === 'PUBLISHED');
    return (
      `There are currently **${published.length} official department events** active and published:\n\n` +
      published
        .map((e) => {
          const item = eventsSummary.find((s) => s.id === e.id);
          const rem = Math.max(0, e.capacity - (e.registeredCount || 0));
          return `• **${e.title}** (${e.category})\n  ⏳ Countdown: **${item?.countdown || 'Scheduled'}**\n  📅 ${e.date} | ⏰ ${e.startTime} - ${e.endTime}\n  📍 Venue: ${e.venue} | 👥 Seats: ${e.registeredCount}/${e.capacity} (${rem} left)`;
        })
        .join('\n\n') +
      `\n\nClick any event in the **Public Catalog** to register, or open the **Calendar** tab to view the monthly schedule!`
    );
  }

  // 6. ADMIT PASS / PRINT SLIP / DOWNLOAD PNG
  if (lower.includes('pass') || lower.includes('ticket') || lower.includes('admit') || lower.includes('slip') || lower.includes('print') || lower.includes('download')) {
    return (
      `🎫 **How to Access, Print, or Download Your Admit Slip**:\n\n` +
      `1. Click **"My Registrations"** in the top navigation bar.\n` +
      `2. Click **"View Admit Slip"** on your registered workshop.\n` +
      `3. Click **"Print Admit Slip"** — this opens a clean printer-friendly print window formatted with official Vignan University letterhead, student roll number, seat zone, barcode, and HOD seal.\n` +
      `4. Click **"Download Slip (PNG)"** to save a high-resolution pass image for offline access on your phone or laptop.\n` +
      `5. Gate security can scan the QR code on your slip or verify your Roll Number for gate entry.`
    );
  }

  // 7. REAL-TIME GATE ATTENDANCE & ROSTERS
  if (lower.includes('attendance') || lower.includes('check-in') || lower.includes('scanner') || lower.includes('roster') || lower.includes('gate') || lower.includes('qr')) {
    return (
      `🛡️ **Gate Attendance & Check-in Workflow**:\n\n` +
      `• **Student Self-Checkin**: Confirmed students can record real-time gate attendance directly from their pass or the event modal.\n` +
      `• **Security Scanner**: Gate Security and Faculty open the **"Attendance & Rosters"** tab and scan the QR code on the student pass or enter their Roll Number.\n` +
      `• **Real-Time Turnout Sync**: Verified attendees are marked "Present" immediately, updating live attendance counters and curriculum credit ledgers across all dashboards.`
    );
  }

  // 8. SIGN IN / LOGIN / ROLES & ACCOUNTS
  if (lower.includes('login') || lower.includes('signin') || lower.includes('sign in') || lower.includes('sign up') || lower.includes('signup') || lower.includes('register account') || lower.includes('role') || lower.includes('account') || lower.includes('auth')) {
    return (
      `🔐 **CampusFlow Multi-Role Authentication & Access**:\n\n` +
      `• **Public Guests / Visitors**: Freely explore the Public Catalog, view event schedules, and check countdown timers without needing to log in.\n` +
      `• **Student Accounts**: Register for events, claim seat passes, download QR admit slips, and record gate attendance.\n` +
      `• **Faculty Convenors**: Draft event charters using the AI Copilot, manage participant rosters, and submit proposals to the HOD.\n` +
      `• **Head of Department (HOD)**: Review pending charters in the statutory clearance queue and apply digital SHA-256 signatures.\n` +
      `• **Switch Roles**: Use the 1-click role switcher in the institutional banner or click **"Portal Sign In"** to authenticate with custom credentials.`
    );
  }

  // 9. CALENDAR & SCHEDULE SYNC
  if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('sync') || lower.includes('google') || lower.includes('outlook')) {
    return (
      `📅 **Events Calendar & Scheduling**:\n\n` +
      `• Click the **"Calendar"** tab in the top navigation bar.\n` +
      `• An interactive monthly grid displays all approved department events with color-coded category chips.\n` +
      `• Use the quick-jump month selector to navigate across active academic terms.\n` +
      `• Click **"Add to Calendar"** on any event card to export to Google Calendar, Microsoft Outlook, or download an offline .ics file!`
    );
  }

  // 10. HOD CLEARANCE & GOVERNANCE
  if (lower.includes('hod') || lower.includes('approval') || lower.includes('governance') || lower.includes('charter') || lower.includes('signature') || lower.includes('review')) {
    return (
      `⚖️ **Institutional HOD Governance Policy**:\n\n` +
      `• **Core Policy**: *NO HOD APPROVAL = NO PUBLIC EVENT*.\n` +
      `• **Proposal Phase**: Faculty draft charters with syllabus mapping (OBE), capacity limits, budget, and learning outcomes.\n` +
      `• **HOD Review Queue**: The Head of Department reviews charters, inspects curriculum alignment, and either approves with a cryptographic digital signature or requests specific revisions.\n` +
      `• **Audit Ledger**: Every approval, submission, and modification is permanently recorded in the Department Audit Trail.`
    );
  }

  // 11. PROFILE CUSTOMIZATION
  if (lower.includes('profile') || lower.includes('photo') || lower.includes('name') || lower.includes('avatar') || lower.includes('rename') || lower.includes('customize')) {
    return (
      `👤 **Customizing Your Profile & Photo**:\n\n` +
      `• Click your user avatar or the edit icon in the top right navigation bar.\n` +
      `• Update your full Name, Academic Designation, and Roll Number / Employee ID.\n` +
      `• Upload a photo directly from your laptop/phone or choose an avatar.\n` +
      `• Click **"Save Changes"** — your profile updates instantly across all admit slips, event cards, and navigation headers!`
    );
  }

  // 12. PORTAL PAGES BREAKDOWN
  if (lower.includes('page') || lower.includes('portal') || lower.includes('explain') || lower.includes('guide') || lower.includes('overview')) {
    return (
      `Here is a complete guide to all pages and capabilities in CampusFlow:\n\n` +
      `• **1. Public Catalog** (\`Catalog\`): Browse all approved university events with live countdown timers and seat availability.\n` +
      `• **2. Events Calendar** (\`Calendar\`): Visual interactive monthly calendar with export to Google Calendar & Outlook.\n` +
      `• **3. My Registrations** (\`My Registrations\`): View confirmed admit slips, trigger **"Print Admit Slip"** for clean A4 printing, or download a PNG pass.\n` +
      `• **4. Faculty Studio** (\`Faculty Studio\`): Faculty convenors draft charters with the AI Copilot and track approval timelines.\n` +
      `• **5. Attendance & Rosters** (\`Rosters\`): Gate security and coordinators admit attendees in real time via QR code or Roll Number.\n` +
      `• **6. HOD Review Queue** (\`HOD Review\`): Department clearance hub where HOD verifies compliance and applies digital signatures.\n` +
      `• **7. Statutory Audit Trail** (\`Audit Trail\`): Immutable chronological audit records of all governance actions.\n` +
      `• **8. Feedback & Analytics** (\`Analytics\`): Student satisfaction ratings and verified NAAC/NBA turnout analytics.`
    );
  }

  // 13. DEFAULT HELPFUL SUMMARY
  return (
    `Hello! I am your Vignan CampusFlow Virtual Assistant. I have complete real-time awareness of all departmental events, venues, schedules, and governance workflows:\n\n` +
    `• **Ask about Events**: "What events are happening?", "Tell me about the AI workshop", "When is the hackathon?", or "Who is the speaker for the database talk?"\n` +
    `• **Ask about Venues & Schedules**: "Where is the event held?", "Show countdown timers", or "What time does it start?"\n` +
    `• **Ask about Passes & Tickets**: "How do I print my admit slip?" or "How to download pass PNG?"\n` +
    `• **Ask about Procedures**: "How does HOD approval work?", "How to check in at gate?", or "How to customize my profile?"\n\n` +
    `What would you like to know?`
  );
}
