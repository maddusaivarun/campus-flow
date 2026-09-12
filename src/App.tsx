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
import { DEMO_USERS } from './data/seedData';
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

  // Core Data Collections
  const [events, setEvents] = useState<DepartmentEvent[]>([]);
  const [studentRegistrations, setStudentRegistrations] = useState<RegistrationRecord[]>([]);
  const [allParticipants, setAllParticipants] = useState<RegistrationRecord[]>([]);
  const [selectedRosterEventId, setSelectedRosterEventId] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [ratedEventIds, setRatedEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              setAuthToken(savedToken);
              if (data.user.role === 'HOD') setActiveTab('hod-review');
              else setActiveTab('discover');
              return;
            }
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

  // Fetch data from server
  const loadData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();

      // 1. Fetch events
      const eventsEndpoint = currentUser.role === 'PUBLIC' ? '/api/events/public' : '/api/events';
      const eventsRes = await fetch(eventsEndpoint, { headers });
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      // 2. Fetch student registrations
      const regRes = await fetch('/api/student/registrations', { headers });
      if (regRes.ok) {
        const regData = await regRes.json();
        setStudentRegistrations(regData.registrations || []);
      }

      // 2b. Fetch complete department / security participant rosters
      if (['HOD', 'FACULTY', 'GATE_SECURITY'].includes(currentUser.role)) {
        try {
          const partRes = await fetch('/api/participants', { headers });
          if (partRes.ok) {
            const partData = await partRes.json();
            setAllParticipants(partData.participants || []);
          }
        } catch (e) {
          // non-critical
        }
      }

      // 3. Fetch notifications
      const notifRes = await fetch('/api/notifications', { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }

      // 4. Fetch audit logs
      const auditRes = await fetch('/api/audit-logs', { headers });
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }

      // 5. Fetch student feedbacks
      const feedbackRes = await fetch('/api/student/feedbacks', { headers });
      if (feedbackRes.ok) {
        const fbData = await feedbackRes.json();
        const fbs: FeedbackRecord[] = fbData.feedbacks || [];
        setRatedEventIds(fbs.map((f) => f.eventId));
      }
    } catch (e) {
      console.error('Error fetching data from server:', e);
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

  // Handle student registration
  const handleRegisterForEvent = async (
    eventId: string,
    options?: { formResponseUrl?: string; markAttendanceImmediately?: boolean }
  ) => {
    // If not authenticated or public, prompt student login or registration
    if (!currentUser || currentUser.role === 'PUBLIC') {
      setAuthModalMode('signin');
      setAuthForcedRole('STUDENT');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register with your Student ID to claim your Admit Slip', 'info');
      return;
    }

    const headers = getAuthHeaders();
    headers['x-user-role'] = 'STUDENT';

    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        seatZone: 'General Admission Zone A',
        formResponseUrl: options?.formResponseUrl,
        markAttendanceImmediately: options?.markAttendanceImmediately ?? true
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    // Refresh state
    await loadData();
    if (data.registration?.checkedIn) {
      showToast(`✓ Registered & Attendance Confirmed Present! Pass ID: ${data.registration.registrationId}`);
    } else {
      showToast(`✓ Registered! Pass ID: ${data.registration.registrationId}`);
    }

    // Open pass modal so student views their admit slip immediately
    setDetailEvent(null);
    setPassModalRecord(data.registration);
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
    const res = await fetch(`/api/events/${eventId}/attend`, {
      method: 'POST',
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to record attendance');
    }

    await loadData();
    showToast(data.message || '✓ Real-time gate attendance confirmed present!');
  };

  // Handle cancel registration
  const handleCancelRegistration = async (eventId: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/events/${eventId}/cancel-registration`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel registration');
    }
    await loadData();
    showToast('Registration cancelled. Seat released.', 'info');
  };

  // Handle HOD review
  const handleReviewEvent = async (
    eventId: string,
    action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
    comment?: string,
    reason?: string
  ) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/events/${eventId}/review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, comment, reason })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'HOD review failed.');
    }

    await loadData();
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
    const res = await fetch('/api/events/bulk-review', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventIds,
        action,
        comment,
        reason
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Bulk review batch operation failed.');
    }

    await loadData();
    showToast(
      action === 'APPROVED'
        ? `✓ Batch Approved: ${data.count} event(s) published with statutory digital signatures!`
        : `✓ Batch Rejected: ${data.count} event(s) rejected with recorded audit logs.`
    );
    return data;
  };

  // Handle Faculty submit to HOD
  const handleSubmitToHod = async (eventId: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/events/${eventId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ comment: 'Submitted for statutory HOD sign-off.' })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit event to HOD.');
    }

    await loadData();
    showToast('✓ Submitted to Head of Department (HOD) for statutory review!');
  };

  // Create event charter
  const handleCreateEvent = async (eventData: Partial<DepartmentEvent>, submitImmediately: boolean) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/events', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...eventData,
        submitImmediately
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create event.');
    }

    await loadData();
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
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete event draft');
    }
    await loadData();
    showToast('Event draft deleted.', 'info');
  };

  // Complete event
  const handleCompleteEvent = async (eventId: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(`/api/events/${eventId}/complete`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to complete event');
    }
    await loadData();
    showToast('Event marked as completed.', 'info');
  };

  // Gate Scanner Check-in
  const handleCheckIn = async (code: string) => {
    const headers = getAuthHeaders();
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers,
      body: JSON.stringify({ registrationId: code })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Check-in failed');
    }

    await loadData();
    return data;
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
          onMarkAllRead={async () => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            const headers = getAuthHeaders();
            try {
              const res = await fetch('/api/notifications/read', { method: 'POST', headers });
              if (res.ok) {
                const data = await res.json();
                if (data.notifications) {
                  setNotifications(data.notifications);
                }
              }
            } catch (err) {
              console.error('Failed to mark notifications read:', err);
            }
            await loadData();
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
