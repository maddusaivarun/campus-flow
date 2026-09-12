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

  // Summary of active events with countdowns
  const now = new Date().getTime();
  const eventsSummary = (events || []).map((e) => {
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

  // Pages explanation
  if (lower.includes('page') || lower.includes('portal') || lower.includes('explain') || lower.includes('guide') || lower.includes('how to use') || lower.includes('what can i do') || lower.includes('overview')) {
    return (
      `Here is a complete guide to all pages and capabilities in CampusFlow:\n\n` +
      `• **1. Public Catalog** (\`Catalog\` in navbar): Browse all approved university events with real-time countdown timers and seat availability.\n` +
      `• **2. Events Calendar** (\`Calendar\` in navbar): Visual interactive calendar to check schedules and sync events to Google Calendar or Outlook.\n` +
      `• **3. My Registrations & Admit Slips** (\`My Passes\` in navbar): View confirmed admit slips, trigger **"Print Admit Slip"** for clean A4 printing, or download a PNG pass.\n` +
      `• **4. HOD Statutory Review Queue** (\`HOD Queue\` in navbar): Review event proposals, inspect curriculum mappings, and apply statutory digital signatures.\n` +
      `• **5. Faculty Activity Management Studio** (\`Faculty Studio\` in navbar): Convenors draft charters with the AI Copilot and track approval timelines.\n` +
      `• **6. Gate Attendance & Participant Roster** (\`Roster\` in navbar): Gate security scanners admit attendees in real time via QR code or Roll Number.\n` +
      `• **7. NAAC & Student Feedback Analytics** (\`Analytics\` in navbar): Real-time student satisfaction ratings and verified turnout metrics.\n` +
      `• **8. Profile Customizer** (Click user avatar in navbar): Customize your name, academic title, and profile photo across the platform.`
    );
  }

  // Countdowns
  if (lower.includes('countdown') || lower.includes('timer') || lower.includes('when') || lower.includes('starts next') || lower.includes('how long')) {
    const published = (events || []).filter(e => e.status === 'PUBLISHED');
    if (published.length === 0) {
      return `Currently, there are no upcoming published events waiting on the page. You can draft and approve a new charter via the Faculty Studio and HOD Queue!`;
    }
    return (
      `Here are the real-time countdown timers for active events:\n\n` +
      published.map(e => {
        const item = eventsSummary.find(s => s.id === e.id);
        return `• **${e.title}**\n  ⏳ **${item?.countdown || 'Active'}** | 📅 ${e.date} (${e.startTime} - ${e.endTime})\n  📍 ${e.venue} | 👥 ${e.registeredCount}/${e.capacity} seats registered`;
      }).join('\n\n') +
      `\n\nEach event card features a real-time ticking clock showing days, hours, minutes, and seconds!`
    );
  }

  // Specific event match
  const matchedEvent = (events || []).find(e =>
    lower.includes(e.title.toLowerCase()) ||
    e.title.toLowerCase().split(' ').some(w => w.length > 4 && lower.includes(w))
  );
  if (matchedEvent) {
    const item = eventsSummary.find(s => s.id === matchedEvent.id);
    return (
      `Here are the official verified details for **${matchedEvent.title}**:\n\n` +
      `• **Category**: ${matchedEvent.category} (${matchedEvent.eventType})\n` +
      `• **Status**: ${matchedEvent.status === 'PUBLISHED' ? '✅ Approved by HOD & Open for Registration' : matchedEvent.status}\n` +
      `• **Live Countdown**: ⏳ **${item?.countdown || 'Scheduled'}**\n` +
      `• **Date & Schedule**: 📅 ${matchedEvent.date} | ⏰ ${matchedEvent.startTime} - ${matchedEvent.endTime}\n` +
      `• **Venue**: 📍 ${matchedEvent.venue}\n` +
      `• **Faculty Convenor**: 👤 ${matchedEvent.organizerName}\n` +
      `• **Curriculum Credits**: 🎓 ${matchedEvent.academicCredits || 2.0} OBE Credits (${matchedEvent.syllabusMapping})\n` +
      `• **Seat Capacity**: 👥 ${matchedEvent.registeredCount}/${matchedEvent.capacity} seats filled (${Math.max(0, matchedEvent.capacity - (matchedEvent.registeredCount || 0))} remaining)\n` +
      `• **Description**: ${matchedEvent.description}\n\n` +
      `You can click on this event in the **Public Catalog** to register and claim your official admit slip!`
    );
  }

  // General events list
  if (lower.includes('event') || lower.includes('workshop') || lower.includes('what is happening') || lower.includes('upcoming') || lower.includes('present') || lower.includes('list') || lower.includes('all')) {
    const published = (events || []).filter(e => e.status === 'PUBLISHED');
    return (
      `There are currently **${published.length} official events** active and published in the department:\n\n` +
      published.map(e => {
        const item = eventsSummary.find(s => s.id === e.id);
        return `• **${e.title}** (${e.category})\n  ⏳ Countdown: **${item?.countdown || 'Scheduled'}**\n  📅 ${e.date} | ⏰ ${e.startTime} - ${e.endTime}\n  📍 Venue: ${e.venue} | 👥 ${e.registeredCount}/${e.capacity} seats registered`;
      }).join('\n\n') +
      `\n\nClick on any event in the **Public Catalog** to register or switch to the **Calendar** view to plan your schedule!`
    );
  }

  // Calendar
  if (lower.includes('calendar') || lower.includes('sync') || lower.includes('outlook') || lower.includes('google')) {
    return (
      `To view or synchronize event schedules:\n` +
      `• Click the **"Calendar"** tab in the top navigation bar.\n` +
      `• You will see an interactive monthly grid with all approved department activities.\n` +
      `• Click **"Add to Calendar"** on any event card to export to Google Calendar, Microsoft Outlook, or download an .ics file!`
    );
  }

  // Admit pass / ticket / printing
  if (lower.includes('pass') || lower.includes('ticket') || lower.includes('admit') || lower.includes('slip') || lower.includes('print') || lower.includes('download')) {
    return (
      `To access, print, or download your official student registration admit slip:\n` +
      `1. Click **"My Passes"** (or **"My Registrations"**) in the top navigation bar.\n` +
      `2. Click **"View Admit Slip"** on your registered workshop.\n` +
      `3. Click **"Print Admit Slip"** to trigger a clean printer-friendly print dialog formatted with official Vignan University letterhead!\n` +
      `4. You can also click **"Download Slip (PNG)"** to save the slip to your phone or laptop.\n` +
      `5. The slip contains your Roll Number, Confirmation ID, seat zone, live countdown timer, and statutory HOD clearance seal.`
    );
  }

  // HOD governance
  if (lower.includes('hod') || lower.includes('approval') || lower.includes('review') || lower.includes('governance') || lower.includes('charter') || lower.includes('signature')) {
    return (
      `The Vignan University Department Governance workflow operates with statutory rigor:\n` +
      `1. **Faculty Proposes Charter**: Convenor drafts the event charter with OBE curriculum mapping using the AI Copilot.\n` +
      `2. **HOD Clearance**: Head of Department opens the **HOD Review Queue**, reviews charters individually or in batch, and signs with a statutory SHA-256 cryptographic seal.\n` +
      `3. **Public Release**: **NO HOD APPROVAL = NO PUBLIC EVENT**. Only cleared events are published to the catalog and open for student registration.`
    );
  }

  // Attendance and gate check-in
  if (lower.includes('attendance') || lower.includes('check-in') || lower.includes('scanner') || lower.includes('roster') || lower.includes('gate')) {
    return (
      `Real-time gate attendance works seamlessly:\n` +
      `• When students arrive at the venue, Gate Security or Faculty open the **"Participant Roster"** view.\n` +
      `• Scan the QR code on the student's admit slip or enter their Roll Number / Pass ID.\n` +
      `• The system records real-time attendance, updates the attendance count immediately, and issues verified academic credits for NAAC/NBA compliance!`
    );
  }

  // Profile customization
  if (lower.includes('profile') || lower.includes('photo') || lower.includes('name') || lower.includes('avatar') || lower.includes('rename')) {
    return (
      `You can customize your profile anytime:\n` +
      `• Click your user avatar pill in the top right navigation bar and select **"Customize Profile"**.\n` +
      `• Edit your official Name, Designation, and Roll Number / Employee ID.\n` +
      `• Upload a photo directly from your device.\n` +
      `• Click **"Save Changes"** — all admit slips, event cards, and navigation headers update immediately across the portal!`
    );
  }

  // Default helpful response
  return (
    `Hello! I am your Vignan CampusFlow Virtual Assistant. I have complete real-time knowledge of all events and pages in this portal:\n\n` +
    `• **Live Events & Countdowns**: Ask "What events are on the page?" or "Show countdown timers".\n` +
    `• **All Pages Guide**: Ask me to "Explain all pages in this portal" for a detailed walkthrough.\n` +
    `• **Print Admit Slips**: Ask how to print or download your official event entry pass.\n` +
    `• **HOD Governance**: Ask about HOD review, digital signatures, or approval procedures.\n` +
    `• **Real-Time Attendance**: Ask how QR gate scanning and turnout analytics work.\n\n` +
    `How can I assist you today?`
  );
}
