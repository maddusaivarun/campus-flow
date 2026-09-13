import React, { useState, useEffect, useCallback } from 'react';
import {
  DepartmentEvent,
  UserProfile,
  UserRole,
  RegistrationRecord,
  SystemNotification,
  AuditLogEntry,
  FeedbackRecord
} from './types';
import {
  DEMO_USERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './data/seedData';
import { safeFetchJson } from './lib/clientFallback';
import { Navbar } from './components/Navbar';
import { PublicCatalog } from './components/PublicCatalog';
import { EventDetailModal } from './components/EventDetailModal';
import { StudentPassModal } from './components/StudentPassModal';
import { HodApprovalQueue } from './components/HodApprovalQueue';
import { CreateEventModal } from './components/CreateEventModal';
import { EventsCalendarView } from './components/EventsCalendarView';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { NotificationsDropdown } from './components/NotificationsDropdown';
import { AuthModal } from './components/AuthModal';
import { ProfileCustomizeModal } from './components/ProfileCustomizeModal';
import { EventFeedbackModal } from './components/EventFeedbackModal';
import { EventFeedbackAnalyticsView } from './components/EventFeedbackAnalyticsView';
import { FacultyStudio } from './components/FacultyStudio';
import { ParticipantManager } from './components/ParticipantManager';
import { AuditTrailView } from './components/AuditTrailView';
import { CampusAIAssistant } from './components/CampusAIAssistant';
import { VignanLogo } from './components/VignanLogo';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Current user persona and session token - default to public visitor without logins
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedCustomUser = localStorage.getItem('campusflow_custom_user');
    if (savedCustomUser) {
      try {
        return JSON.parse(savedCustomUser);
      } catch (e) {
        // ignore
      }
    }
    return DEMO_USERS.public;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('campusflow_token');
  });

  // Navigation tab - default to Public Catalog ('discover')
  const [activeTab, setActiveTab] = useState<string>('discover');

  // Core Data Collections (initialized with pre-seeded data so Netlify renders instantly)
  const [events, setEvents] = useState<DepartmentEvent[]>(() => {
    try {
      const saved = localStorage.getItem('campusflow_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_EVENTS;
  });

  const [studentRegistrations, setStudentRegistrations] = useState<RegistrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('campusflow_registrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REGISTRATIONS;
  });

  const [allParticipants, setAllParticipants] = useState<RegistrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('campusflow_participants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REGISTRATIONS;
  });

  const [selectedRosterEventId, setSelectedRosterEventId] = useState<string | undefined>();

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('campusflow_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('campusflow_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  const [ratedEventIds, setRatedEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals & Drawers
  const [detailEvent, setDetailEvent] = useState<DepartmentEvent | null>(null);
  const [passModalRecord, setPassModalRecord] = useState<RegistrationRecord | null>(null);
  const [feedbackModalEvent, setFeedbackModalEvent] = useState<DepartmentEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authForcedRole, setAuthForcedRole] = useState<UserRole | undefined>(undefined);

  // Dark mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('campusflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campusflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campusflow_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper to build authenticated headers
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': currentUser.role,
      'x-user-id': currentUser.id,
      'x-dept-id': currentUser.departmentId
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      headers['x-auth-token'] = authToken;
    }
    return headers;
  }, [authToken, currentUser]);

  // Check initial session token with backend
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('campusflow_token');
      if (savedToken) {
        try {
          const data = await safeFetchJson<{ user: UserProfile }>('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          });
          if (data && data.user) {
            setCurrentUser(data.user);
            setAuthToken(savedToken);
            if (data.user.role === 'HOD') setActiveTab('hod-review');
            else setActiveTab('discover');
            return;
          }
        } catch (e) {
          console.warn('Session verification failed, staying on public');
        }
      }
      // Clean public guest default without forced auto-login
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('campusflow_token', token);
    localStorage.setItem('campusflow_custom_user', JSON.stringify(user));
    showToast(`✓ Welcome, ${user.name}! Logged in as ${user.role}.`);
    if (user.role === 'HOD') setActiveTab('hod-review');
    else setActiveTab('discover');
  };

  const handleSignOut = () => {
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_custom_user');
    setAuthToken(null);
    setCurrentUser(DEMO_USERS.public);
    setActiveTab('discover');
    showToast('Signed out. You are now browsing as a public guest.', 'info');
  };

  const handleQuickRoleSwitch = (role: UserRole) => {
    if (role === 'PUBLIC') {
      handleSignOut();
      return;
    }
    const demoKey = role === 'HOD' ? 'hod' : role === 'FACULTY' ? 'faculty' : 'student';
    const user = DEMO_USERS[demoKey];
    const token = `client-token-${role.toLowerCase()}-${Date.now()}`;
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('campusflow_token', token);
    localStorage.setItem('campusflow_custom_user', JSON.stringify(user));
    showToast(`✓ Switched to ${user.name} (${user.role} view)`);
    if (role === 'HOD') setActiveTab('hod-review');
    else if (role === 'FACULTY') setActiveTab('faculty-studio');
    else setActiveTab('discover');
  };

  // Fetch data from server with safe client fallback
  const loadData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();

      // 1. Fetch events (Maintain full department lifecycle state)
      const eventsData = await safeFetchJson<{ events: DepartmentEvent[] }>('/api/events', { headers });
      if (eventsData && Array.isArray(eventsData.events) && eventsData.events.length > 0) {
        setEvents(eventsData.events);
        localStorage.setItem('campusflow_events', JSON.stringify(eventsData.events));
      } else {
        try {
          const saved = localStorage.getItem('campusflow_events');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setEvents(parsed);
          }
        } catch {}
      }

      // 2. Fetch student registrations
      const regData = await safeFetchJson<{ registrations: RegistrationRecord[] }>('/api/student/registrations', { headers });
      if (regData && Array.isArray(regData.registrations)) {
        setStudentRegistrations(regData.registrations);
        localStorage.setItem('campusflow_registrations', JSON.stringify(regData.registrations));
      }

      // 2b. Fetch complete department / security participant rosters
      if (['HOD', 'FACULTY', 'GATE_SECURITY'].includes(currentUser.role)) {
        const partData = await safeFetchJson<{ participants: RegistrationRecord[] }>('/api/participants', { headers });
        if (partData && Array.isArray(partData.participants)) {
          setAllParticipants(partData.participants);
          localStorage.setItem('campusflow_participants', JSON.stringify(partData.participants));
        }
      }

      // 3. Fetch notifications
      const notifData = await safeFetchJson<{ notifications: SystemNotification[] }>('/api/notifications', { headers });
      if (notifData && Array.isArray(notifData.notifications)) {
        setNotifications(notifData.notifications);
        localStorage.setItem('campusflow_notifications', JSON.stringify(notifData.notifications));
      }

      // 4. Fetch audit logs
      const auditData = await safeFetchJson<{ auditLogs: AuditLogEntry[] }>('/api/audit-logs', { headers });
      if (auditData && Array.isArray(auditData.auditLogs)) {
        setAuditLogs(auditData.auditLogs);
        localStorage.setItem('campusflow_audit_logs', JSON.stringify(auditData.auditLogs));
      }

      // 5. Fetch student feedbacks
      const fbData = await safeFetchJson<{ feedbacks: FeedbackRecord[] }>('/api/student/feedbacks', { headers });
      if (fbData && Array.isArray(fbData.feedbacks)) {
        setRatedEventIds(fbData.feedbacks.map((f) => f.eventId));
      }
    } catch (e) {
      console.warn('Network sync notice (using local state):', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, getAuthHeaders]);

  useEffect(() => {
    loadData();

    // Auto-refresh interval (every 8 seconds when active, keeps all attendance, rosters, and analytics live)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData();
      }
    }, 8000);

    // Immediate sync on tab focus or visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    const handleFocus = () => {
      loadData();
    };
    const handleCustomRefresh = () => {
      loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('campusflow:refresh', handleCustomRefresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('campusflow:refresh', handleCustomRefresh);
    };
  }, [loadData, activeTab]);

  // Handle student registration with resilient fallback
  const handleRegisterForEvent = async (
    eventId: string,
    options?: { formResponseUrl?: string; markAttendanceImmediately?: boolean }
  ) => {
    if (!currentUser || currentUser.role === 'PUBLIC') {
      setAuthModalMode('signin');
      setAuthForcedRole('STUDENT');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register with your Student ID to claim your Admit Slip', 'info');
      return;
    }

    const headers = getAuthHeaders();
    headers['x-user-role'] = 'STUDENT';

    let data: any = null;
    try {
      data = await safeFetchJson<{ registration: RegistrationRecord }>(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          seatZone: 'General Admission Zone A',
          formResponseUrl: options?.formResponseUrl,
          markAttendanceImmediately: options?.markAttendanceImmediately ?? true
        })
      });
    } catch {}

    let regRecord: RegistrationRecord;
    if (data && data.registration) {
      regRecord = data.registration;
      await loadData();
    } else {
      // Local fallback for static hosting
      const targetEvent = events.find((e) => e.id === eventId);
      const regId = `VUG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      regRecord = {
        id: `reg-${Date.now()}`,
        registrationId: regId,
        eventId,
        eventTitle: targetEvent?.title || 'Department Workshop',
        eventDate: targetEvent?.date || '2026-09-24',
        eventVenue: targetEvent?.venue || 'Campus Auditorium',
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentRoll: currentUser.identifier || '221FA04001',
        studentEmail: currentUser.email,
        studentDepartment: currentUser.departmentName || 'Department of CSBS & IoT',
        seatZone: 'General Admission Zone A',
        qrToken: `VUG-QR-${regId}:${currentUser.id}`,
        registeredAt: new Date().toISOString(),
        status: 'CONFIRMED',
        checkedIn: options?.markAttendanceImmediately ?? true,
        checkedInAt: (options?.markAttendanceImmediately ?? true) ? new Date().toISOString() : undefined
      };
      setStudentRegistrations((prev) => {
        const next = [regRecord, ...prev];
        localStorage.setItem('campusflow_registrations', JSON.stringify(next));
        return next;
      });
      setAllParticipants((prev) => {
        const next = [regRecord, ...prev];
        localStorage.setItem('campusflow_participants', JSON.stringify(next));
        return next;
      });
      setEvents((prev) => {
        const next = prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                registeredCount: (e.registeredCount || 0) + 1,
                attendanceCount:
                  (options?.markAttendanceImmediately ?? true)
                    ? (e.attendanceCount || 0) + 1
                    : (e.attendanceCount || 0)
              }
            : e
        );
        localStorage.setItem('campusflow_events', JSON.stringify(next));
        return next;
      });
    }

    if (regRecord.checkedIn) {
      showToast(`✓ Registered & Attendance Confirmed Present! Pass ID: ${regRecord.registrationId}`);
    } else {
      showToast(`✓ Registered! Pass ID: ${regRecord.registrationId}`);
    }

    // Open pass modal so student views their admit slip immediately
    setDetailEvent(null);
    setPassModalRecord(regRecord);
  };

  // Handle student real-time attendance self check-in
  const handleMarkAttendance = async (eventId: string) => {
    if (!currentUser || currentUser.role === 'PUBLIC') {
      setAuthModalMode('signin');
      setAuthForcedRole('STUDENT');
      setIsAuthModalOpen(true);
      showToast('Please sign in with your student account to record attendance', 'info');
      return;
    }

    const headers = getAuthHeaders();
    try {
      await fetch(`/api/events/${eventId}/attend`, {
        method: 'POST',
        headers
      });
    } catch {}

    setEvents((prev) => {
      const next = prev.map((e) => (e.id === eventId ? { ...e, attendanceCount: (e.attendanceCount || 0) + 1 } : e));
      localStorage.setItem('campusflow_events', JSON.stringify(next));
      return next;
    });
    setStudentRegistrations((prev) => {
      const next = prev.map((r) => r.eventId === eventId ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r);
      localStorage.setItem('campusflow_registrations', JSON.stringify(next));
      return next;
    });
    setAllParticipants((prev) => {
      const next = prev.map((r) => r.eventId === eventId ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r);
      localStorage.setItem('campusflow_participants', JSON.stringify(next));
      return next;
    });
    showToast('✓ Real-time gate attendance confirmed present!');
  };

  // Handle cancel registration
  const handleCancelRegistration = async (eventId: string) => {
    const headers = getAuthHeaders();
    try {
      await fetch(`/api/events/${eventId}/cancel-registration`, {
        method: 'POST',
        headers
      });
    } catch {}

    setStudentRegistrations((prev) => {
      const next = prev.filter((r) => r.eventId !== eventId);
      localStorage.setItem('campusflow_registrations', JSON.stringify(next));
      return next;
    });
    setAllParticipants((prev) => {
      const next = prev.filter((r) => r.eventId !== eventId);
      localStorage.setItem('campusflow_participants', JSON.stringify(next));
      return next;
    });
    setEvents((prev) => {
      const next = prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 0) - 1) }
          : e
      );
      localStorage.setItem('campusflow_events', JSON.stringify(next));
      return next;
    });
    showToast('Registration cancelled. Seat released.', 'info');
  };

  // Handle HOD review with resilient fallback
  const handleReviewEvent = async (
    eventId: string,
    action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
    comment?: string,
    reason?: string
  ) => {
    const headers = getAuthHeaders();
    try {
      await safeFetchJson<any>(`/api/events/${eventId}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, comment, reason })
      });
    } catch {}

    const now = new Date().toISOString();
    const sig =
      action === 'APPROVED'
        ? `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
        : undefined;

    setEvents((prev) => {
      const updated = prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status:
                action === 'APPROVED'
                  ? 'PUBLISHED'
                  : action === 'CHANGES_REQUESTED'
                  ? 'CHANGES_REQUESTED'
                  : 'REJECTED',
              digitalSignatureHash: sig,
              hodReviewerName: currentUser.name || 'Head of Department (CSBS & IoT)',
              hodReviewComment: comment || reason || 'Reviewed and digitally signed.',
              publishedAt: action === 'APPROVED' ? now : e.publishedAt,
              updatedAt: now
            }
          : e
      );
      localStorage.setItem('campusflow_events', JSON.stringify(updated));
      return updated;
    });

    // Record audit log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      eventId,
      action: action === 'APPROVED' ? 'EVENT_APPROVED' : action === 'CHANGES_REQUESTED' ? 'EVENT_CHANGES_REQUESTED' : 'EVENT_REJECTED',
      actorName: currentUser.name || 'Head of Department (CSBS & IoT)',
      actorRole: 'HOD',
      details: `Event status updated to ${action}. ${comment || reason || ''}`.trim(),
      timestamp: now
    };
    setAuditLogs((prev) => {
      const next = [newLog, ...prev];
      localStorage.setItem('campusflow_audit_logs', JSON.stringify(next));
      return next;
    });

    showToast(
      action === 'APPROVED'
        ? '✓ Event approved with digital signature and published publicly!'
        : action === 'CHANGES_REQUESTED'
        ? 'Revisions requested. Faculty organizer notified.'
        : 'Event proposal rejected.'
    );
  };

  // Bulk Review handler for HOD
  const handleBulkReviewEvents = async (
    eventIds: string[],
    action: 'APPROVED' | 'REJECTED',
    comment?: string,
    reason?: string
  ) => {
    const headers = getAuthHeaders();
    try {
      await safeFetchJson<any>('/api/events/bulk-review', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventIds,
          action,
          comment,
          reason
        })
      });
    } catch {}

    const now = new Date().toISOString();
    setEvents((prev) => {
      const updated = prev.map((e) => {
        if (!eventIds.includes(e.id)) return e;
        const sig =
          action === 'APPROVED'
            ? `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
            : undefined;
        return {
          ...e,
          status: action === 'APPROVED' ? 'PUBLISHED' : 'REJECTED',
          digitalSignatureHash: sig,
          hodReviewerName: currentUser.name || 'Head of Department (CSBS & IoT)',
          hodReviewComment: comment || reason || 'Statutory batch clearance.',
          publishedAt: action === 'APPROVED' ? now : e.publishedAt,
          updatedAt: now
        };
      });
      localStorage.setItem('campusflow_events', JSON.stringify(updated));
      return updated;
    });

    showToast(
      action === 'APPROVED'
        ? `✓ Batch Approved: ${eventIds.length} event(s) published with statutory digital signatures!`
        : `✓ Batch Rejected: ${eventIds.length} event(s) rejected with recorded audit logs.`
    );
    return {
      success: true,
      count: eventIds.length,
      message: `Batch ${action}: ${eventIds.length} event(s) processed.`
    };
  };

  // Handle Faculty submit to HOD
  const handleSubmitToHod = async (eventId: string) => {
    const headers = getAuthHeaders();
    try {
      await fetch(`/api/events/${eventId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ comment: 'Submitted for statutory HOD sign-off.' })
      });
    } catch {}

    const now = new Date().toISOString();
    setEvents((prev) => {
      const updated = prev.map((e) =>
        e.id === eventId ? { ...e, status: 'PENDING_REVIEW', submittedAt: now, updatedAt: now } : e
      );
      localStorage.setItem('campusflow_events', JSON.stringify(updated));
      return updated;
    });

    const target = events.find((e) => e.id === eventId);
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      userId: 'user-hod-01',
      role: 'HOD',
      title: 'Draft Submitted for HOD Review',
      message: `Draft "${target?.title || 'Department Event'}" submitted for statutory review.`,
      type: 'action_required',
      read: false,
      createdAt: now,
      eventId
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      localStorage.setItem('campusflow_notifications', JSON.stringify(next));
      return next;
    });

    showToast('✓ Submitted to Head of Department (HOD) for statutory review!');
  };

  // Create event charter with fallback
  const handleCreateEvent = async (eventData: Partial<DepartmentEvent>, submitImmediately: boolean) => {
    const headers = getAuthHeaders();
    let data: any = null;

    const payload = {
      ...eventData,
      organizerId: currentUser.id || 'user-faculty-01',
      organizerName: currentUser.name || 'Faculty Coordinator (CSBS & IoT)',
      organizerContact: currentUser.email || 'faculty.csbsiot@vignan.ac.in',
      organizerDesignation: currentUser.designation || 'Faculty Coordinator',
      departmentId: currentUser.departmentId || 'dept-csbsiot-vignan',
      departmentName: currentUser.departmentName || 'Department of CSBS & IoT',
      submitImmediately
    };

    try {
      data = await safeFetchJson<any>('/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch {}

    const now = new Date().toISOString();
    const newEvt: DepartmentEvent = (data && data.event) ? data.event : {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title: eventData.title || 'Department Workshop',
      shortDescription: eventData.shortDescription || eventData.title || '',
      description: eventData.description || eventData.shortDescription || eventData.title || '',
      category: eventData.category || 'Workshop',
      eventType: eventData.eventType || 'Hands-on Technical Workshop',
      status: submitImmediately ? 'PENDING_REVIEW' : 'DRAFT',
      date: eventData.date || '2026-09-24',
      startTime: eventData.startTime || '09:30',
      endTime: eventData.endTime || '13:00',
      venue: eventData.venue || 'IoT & Embedded Systems Lab',
      locationDetails: eventData.locationDetails || 'CSBS Block, Room 204',
      capacity: Number(eventData.capacity) || 60,
      registeredCount: 0,
      attendanceCount: 0,
      academicCredits: Number(eventData.academicCredits) || 2.0,
      syllabusMapping: eventData.syllabusMapping || 'Module 4 Outcome-Based Education Aligned',
      departmentId: currentUser.departmentId || 'dept-csbsiot-vignan',
      departmentName: currentUser.departmentName || 'Department of CSBS & IoT',
      organizerId: currentUser.id || 'user-faculty-01',
      organizerName: currentUser.name || 'Faculty Coordinator (CSBS & IoT)',
      organizerContact: currentUser.email || 'faculty.csbsiot@vignan.ac.in',
      organizerDesignation: currentUser.designation || 'Faculty Coordinator',
      posterUrl: eventData.posterUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      registrationDeadline: eventData.registrationDeadline || eventData.date || '2026-09-23',
      registrationRequired: true,
      targetAudience: eventData.targetAudience || 'Undergraduate Students',
      eligibility: eventData.eligibility || 'All Years B.Tech',
      participationInstructions: eventData.participationInstructions || 'Bring laptop and institutional ID.',
      registrationFormUrl: eventData.registrationFormUrl,
      version: 1,
      createdAt: now,
      updatedAt: now,
      submittedAt: submitImmediately ? now : undefined,
      objectives: eventData.objectives || [],
      agenda: eventData.agenda || [],
      requirements: eventData.requirements || { prerequisites: '', thingsToBring: '', softwareTools: '' },
      speaker: eventData.speaker || {
        name: 'Faculty Speaker',
        designation: 'Coordinator',
        organization: 'Vignan',
        bio: 'Department Faculty Coordinator'
      }
    };

    // Update React events state immediately and persist to localStorage
    setEvents((prev) => {
      const next = [newEvt, ...prev.filter((e) => e.id !== newEvt.id)];
      localStorage.setItem('campusflow_events', JSON.stringify(next));
      return next;
    });

    if (submitImmediately) {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        userId: 'user-hod-01',
        role: 'HOD',
        title: 'New Event Proposal Pending Review',
        message: `"${newEvt.title}" submitted by ${newEvt.organizerName} for statutory HOD review.`,
        type: 'action_required',
        read: false,
        createdAt: now,
        eventId: newEvt.id
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        localStorage.setItem('campusflow_notifications', JSON.stringify(next));
        return next;
      });

      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        eventId: newEvt.id,
        action: 'EVENT_SUBMITTED',
        actorName: newEvt.organizerName,
        actorRole: 'FACULTY',
        details: `Charter "${newEvt.title}" submitted to HOD Clearance Queue.`,
        timestamp: now
      };
      setAuditLogs((prev) => {
        const next = [newLog, ...prev];
        localStorage.setItem('campusflow_audit_logs', JSON.stringify(next));
        return next;
      });
    }

    setIsCreateModalOpen(false);
    showToast(
      submitImmediately
        ? '✓ Charter created and submitted to HOD Clearance Queue!'
        : '✓ Charter draft saved successfully!'
    );
  };

  // Delete event draft
  const handleDeleteEvent = async (eventId: string) => {
    const headers = getAuthHeaders();
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers
      });
    } catch {}

    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      localStorage.setItem('campusflow_events', JSON.stringify(updated));
      return updated;
    });
    showToast('Event draft deleted.', 'info');
  };

  // Complete event
  const handleCompleteEvent = async (eventId: string) => {
    const headers = getAuthHeaders();
    try {
      await fetch(`/api/events/${eventId}/complete`, {
        method: 'POST',
        headers
      });
    } catch {}

    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === eventId ? { ...e, status: 'COMPLETED' } : e));
      localStorage.setItem('campusflow_events', JSON.stringify(updated));
      return updated;
    });
    showToast('Event marked as completed.', 'info');
  };

  // Gate Scanner Check-in with fallback
  const handleCheckIn = async (code: string) => {
    const headers = getAuthHeaders();
    let data: any = null;
    try {
      data = await safeFetchJson<any>('/api/check-in', {
        method: 'POST',
        headers,
        body: JSON.stringify({ registrationId: code })
      });
    } catch {}

    if (data && data.success) {
      await loadData();
      return data;
    }

    // Local fallback for static hosting
    const clean = code.trim().toLowerCase();
    const matched = allParticipants.find(
      (r) =>
        r.registrationId.toLowerCase() === clean ||
        r.id.toLowerCase() === clean ||
        (r.qrToken && r.qrToken.toLowerCase() === clean) ||
        r.studentRoll.toLowerCase() === clean
    );
    if (!matched) {
      throw new Error('No confirmed registration found for this pass or roll number.');
    }
    const updatedReg: RegistrationRecord = {
      ...matched,
      checkedIn: true,
      checkedInAt: new Date().toISOString()
    };
    setAllParticipants((prev) => {
      const next = prev.map((r) => (r.id === updatedReg.id ? updatedReg : r));
      localStorage.setItem('campusflow_participants', JSON.stringify(next));
      return next;
    });
    setStudentRegistrations((prev) => {
      const next = prev.map((r) => (r.id === updatedReg.id ? updatedReg : r));
      localStorage.setItem('campusflow_registrations', JSON.stringify(next));
      return next;
    });
    setEvents((prev) => {
      const next = prev.map((e) =>
        e.id === updatedReg.eventId
          ? { ...e, attendanceCount: (e.attendanceCount || 0) + 1 }
          : e
      );
      localStorage.setItem('campusflow_events', JSON.stringify(next));
      return next;
    });
    return {
      success: true,
      message: `Admitted: ${updatedReg.studentName} (${updatedReg.studentRoll})`,
      registration: updatedReg
    };
  };

  // Reset database to seed
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const handleResetDemo = () => {
    setShowResetConfirmModal(true);
  };

  const executeResetDemo = async () => {
    setShowResetConfirmModal(false);
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await loadData();
        showToast('✓ Database reset to initial production state.');
      }
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setIsResetting(false);
    }
  };

  // Pending count for HOD
  const pendingCount = events.filter((e) => e.status === 'PENDING_REVIEW').length;
  const registeredEventIds = studentRegistrations.map((r) => r.eventId);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-emerald-950 text-emerald-100 border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenAuthModal={(mode = 'signin', role) => {
          setAuthModalMode(mode);
          setAuthForcedRole(role);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onOpenCustomizeProfile={() => setIsProfileModalOpen(true)}
        onProposeEvent={() => setIsCreateModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onQuickRoleSwitch={handleQuickRoleSwitch}
      />

      {/* Notifications Dropdown Modal */}
      {isNotificationsOpen && (
        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectEventId={(eventId) => {
            const evt = events.find((e) => e.id === eventId);
            if (evt) {
              setDetailEvent(evt);
              setIsNotificationsOpen(false);
            }
          }}
          onMarkRead={async (notificationId: string) => {
            setNotifications((prev) => {
              const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
              localStorage.setItem('campusflow_notifications', JSON.stringify(updated));
              return updated;
            });
            const headers = getAuthHeaders();
            try {
              await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST', headers });
            } catch {}
          }}
          onMarkAllRead={async () => {
            setNotifications((prev) => {
              const updated = prev.map((n) => ({ ...n, read: true }));
              localStorage.setItem('campusflow_notifications', JSON.stringify(updated));
              return updated;
            });
            const headers = getAuthHeaders();
            try {
              const res = await fetch('/api/notifications/read', { method: 'POST', headers });
              if (res.ok) {
                const data = await res.json();
                if (data.notifications) {
                  setNotifications(data.notifications);
                  localStorage.setItem('campusflow_notifications', JSON.stringify(data.notifications));
                }
              }
            } catch (err) {
              console.error('Failed to mark notifications read:', err);
            }
          }}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loading Vignan Department State...
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: PUBLIC DISCOVERY CATALOG */}
            {activeTab === 'discover' && (
              <PublicCatalog
                events={events}
                onSelectEvent={(evt) => setDetailEvent(evt)}
                registeredEventIds={registeredEventIds}
                onProposeEvent={() => setIsCreateModalOpen(true)}
              />
            )}

            {/* VIEW 2: UNIVERSITY EVENTS CALENDAR */}
            {activeTab === 'calendar' && (
              <EventsCalendarView
                events={events}
                onSelectEvent={(evt) => setDetailEvent(evt)}
                registeredEventIds={registeredEventIds}
              />
            )}

            {/* VIEW 3: HOD STATUTORY APPROVAL QUEUE (ONLY VISIBLE TO AUTHENTICATED HOD) */}
            {(activeTab === 'hod-review' || activeTab === 'hod-queue') && (
              <HodApprovalQueue
                events={events}
                onReviewEvent={handleReviewEvent}
                onBulkReviewEvents={handleBulkReviewEvents}
                onSelectEvent={(evt) => setDetailEvent(evt)}
                currentUser={currentUser}
              />
            )}

            {/* VIEW 4: FACULTY STUDIO (EVENT MANAGEMENT & DRAFTS) */}
            {activeTab === 'faculty-studio' && (
              <FacultyStudio
                events={events}
                currentUser={currentUser}
                onCreateNew={() => setIsCreateModalOpen(true)}
                onSubmitToHod={handleSubmitToHod}
                onDeleteEvent={handleDeleteEvent}
                onSelectEvent={(evt) => setDetailEvent(evt)}
                onViewRoster={(evt) => {
                  setSelectedRosterEventId(evt.id);
                  setActiveTab('participants');
                }}
                onCompleteEvent={handleCompleteEvent}
              />
            )}

            {/* VIEW 5: PARTICIPANT ROSTER & GATE ATTENDANCE CHECK-IN */}
            {(activeTab === 'participants' || activeTab === 'roster') && (
              <ParticipantManager
                events={events}
                participants={allParticipants}
                currentUser={currentUser}
                selectedEventId={selectedRosterEventId}
                onSelectEvent={(evt) => setDetailEvent(evt)}
                onCheckInParticipant={handleCheckIn}
              />
            )}

            {/* VIEW 6: STATUTORY GOVERNANCE & AUDIT TRAIL */}
            {activeTab === 'audit-trail' && (
              <AuditTrailView auditLogs={auditLogs} currentUser={currentUser} />
            )}

            {/* VIEW 7: STUDENT REGISTRATIONS & ADMIT SLIPS */}
            {(activeTab === 'my-passes' || activeTab === 'registrations') && (
              <MyRegistrationsView
                registrations={studentRegistrations}
                onViewPass={(reg) => setPassModalRecord(reg)}
                onSelectRegistration={(reg) => setPassModalRecord(reg)}
                onCancelRegistration={handleCancelRegistration}
                onExploreEvents={() => setActiveTab('discover')}
                onExploreMore={() => setActiveTab('discover')}
                onRateEvent={(eventId) => {
                  const ev = events.find((e) => e.id === eventId);
                  if (ev) setFeedbackModalEvent(ev);
                }}
                ratedEventIds={ratedEventIds}
                currentUser={currentUser}
              />
            )}

            {/* VIEW 8: STUDENT FEEDBACK & PERFORMANCE ANALYTICS */}
            {activeTab === 'feedback-analytics' && (
              <EventFeedbackAnalyticsView events={events} currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* MODAL 1: EVENT DETAIL & STUDENT REGISTRATION */}
      {detailEvent && (
        <EventDetailModal
          event={events.find((e) => e.id === detailEvent.id) || detailEvent}
          onClose={() => setDetailEvent(null)}
          currentUser={currentUser}
          isRegistered={registeredEventIds.includes(detailEvent.id)}
          registrationRecord={studentRegistrations.find((r) => r.eventId === detailEvent.id)}
          onRegister={handleRegisterForEvent}
          onMarkAttendance={handleMarkAttendance}
          onViewPass={(reg) => {
            setDetailEvent(null);
            setPassModalRecord(reg);
          }}
        />
      )}

      {/* MODAL 2: STUDENT QR GATE PASS */}
      {passModalRecord && (
        <StudentPassModal
          registration={passModalRecord}
          onClose={() => setPassModalRecord(null)}
          onCancelRegistration={handleCancelRegistration}
        />
      )}

      {/* MODAL 3: FACULTY EVENT CHARTER CREATOR (WITH AI COPILOT) */}
      {isCreateModalOpen && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          onSubmitEvent={handleCreateEvent}
          onCreateEvent={handleCreateEvent}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* MODAL 4: AUTHENTICATION MODAL (SIGN IN / SIGN UP) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
          forcedRole={authForcedRole}
        />
      )}

      {/* MODAL 5: PROFILE & AVATAR CUSTOMIZER */}
      {isProfileModalOpen && (
        <ProfileCustomizeModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={async (updated) => {
            const headers = getAuthHeaders();
            const res = await fetch('/api/auth/profile', {
              method: 'PUT',
              headers,
              body: JSON.stringify(updated)
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Failed to update profile');
            }
            const data = await res.json();
            setCurrentUser(data.user);
            showToast('✓ Profile, name & photo updated successfully!');
            loadData();
          }}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            showToast('✓ Profile, name & photo updated successfully!');
            loadData();
          }}
        />
      )}

      {/* MODAL 6: POST-EVENT FEEDBACK MODAL */}
      {feedbackModalEvent && (
        <EventFeedbackModal
          isOpen={!!feedbackModalEvent}
          onClose={() => setFeedbackModalEvent(null)}
          event={feedbackModalEvent}
          currentUser={currentUser}
          onFeedbackSubmitted={async (fb) => {
            setRatedEventIds((prev) => [...prev, fb.eventId]);
            showToast('✓ Post-event feedback recorded for faculty performance ledger!');
            await loadData();
          }}
        />
      )}

      {/* MODAL 7: DATABASE RESET CONFIRMATION */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Reset University Database?
                </h3>
                <p className="text-xs text-slate-500">
                  Restore baseline events, registrations, and HOD queues
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will reset the persistent database back to the initial official CSBS & IoT department seed data. All newly created test events, registrations, and feedback will be restored to their baseline state.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeResetDemo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIRTUAL AI ASSISTANT (CAMPUSFLOW AI) */}
      <CampusAIAssistant
        currentUser={currentUser}
        activeView={activeTab}
        events={events}
        onNavigate={(view) => {
          if (view === 'profile') setIsProfileModalOpen(true);
          else if (view === 'catalog' || view === 'discover') setActiveTab('discover');
          else if (view === 'calendar') setActiveTab('calendar');
          else if (view === 'passes' || view === 'registrations' || view === 'my-passes') setActiveTab('my-passes');
          else if (view === 'hod' || view === 'hod-review' || view === 'hod-queue') setActiveTab('hod-review');
          else if (view === 'feedback' || view === 'feedback-analytics') setActiveTab('feedback-analytics');
          else setActiveTab(view);
        }}
      />

      {/* University Footer with Logo at Edges */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1 rounded-md">
              <VignanLogo size="sm" showText={false} />
            </div>
            <div>
              <p className="font-bold text-slate-200">
                CAMPUSFLOW • Vignan's Foundation for Science, Technology & Research
              </p>
              <p className="text-[11px] text-slate-400">
                The Digital Operating System for University Department Activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center sm:text-right text-[11px] space-y-1">
              <p className="text-slate-300 font-mono">
                Core Principle: <span className="text-amber-400 font-bold">NO HOD APPROVAL = NO PUBLIC EVENT</span>
              </p>
              <p className="text-slate-400">
                Department of CSBS & IoT • Official University Portal
              </p>
            </div>
            <div className="hidden md:block">
              <VignanLogo size="sm" showText={false} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
