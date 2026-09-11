import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, UserRole, DepartmentEvent } from './src/types';
import {
  createUser,
  authenticateUser,
  verifyToken,
  getUserById,
  getPublicEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  reviewEvent,
  bulkReviewEvents,
  completeEvent,
  registerStudent,
  recordStudentAttendance,
  cancelRegistration,
  getStudentRegistrations,
  getEventParticipants,
  getAllParticipants,
  checkInParticipant,
  admitParticipantManually,
  removeParticipantByOrganizer,
  getUserNotifications,
  markNotificationsAsRead,
  getAuditLogs,
  resetDatabase,
  updateUserProfile,
  submitFeedback,
  getEventFeedbacks,
  getStudentFeedbacks,
  getAllFeedbackMetrics
} from './src/lib/db';
import {
  isSupabaseConfigured,
  supabaseSyncEvent,
  supabaseDeleteEvent,
  supabaseSyncApproval,
  supabaseSyncRegistration,
  supabaseCancelRegistration,
  supabaseCheckInParticipant,
  supabaseSyncProfile,
  getDatabaseStatus
} from './src/lib/supabase';
import { DEMO_USERS } from './src/data/seedData';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile | null;
    }
  }
}

// Lazy-initialized Gemini client for AI Copilot
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
      aiClient = null;
    }
  }
  return aiClient;
}

// Robust fallback runner across active Gemini 3.x models with timeout protection
async function callGeminiWithFallbacks(ai: GoogleGenAI, contents: string, config?: Record<string, any>) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents,
        ...(config ? { config } : {})
      });

      // 10-second timeout per model so requests never hang the UI
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Model ${model} request timed out after 10s`)), 10000);
      });

      const response = await Promise.race([callPromise, timeoutPromise]) as any;
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Model ${model} encountered issue (${err.status || err.message}). Trying fallback...`);
    }
  }
  throw lastError || new Error('All candidate Gemini models failed.');
}

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token && typeof req.headers['x-auth-token'] === 'string') {
    token = req.headers['x-auth-token'];
  }

  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      req.user = verified;
      return next();
    }
  }

  // Fallback to demo user headers for backward compatibility
  const userId = req.headers['x-user-id'] as string;
  const role = req.headers['x-user-role'] as UserRole;
  if (userId) {
    const user = getUserById(userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (role && DEMO_USERS[role.toLowerCase() as keyof typeof DEMO_USERS]) {
    req.user = DEMO_USERS[role.toLowerCase() as keyof typeof DEMO_USERS];
    return next();
  }

  req.user = null;
  next();
}

// Role-based route guard middleware
function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied: Role ${req.user.role} is not authorized for this operation. Required: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      product: 'CAMPUSFLOW — Vignan University',
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // REAL AUTHENTICATION ROUTES
  // ==========================================

  const handleSignup = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, departmentName, identifier, phone } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const result = await createUser({
        name,
        email,
        password,
        role,
        departmentName,
        identifier,
        phone
      });

      // Synchronize profile to Supabase database
      supabaseSyncProfile(result.user).catch((e) =>
        console.warn('[Supabase] Profile sync notice on signup:', e)
      );

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Signup failed.' });
    }
  };

  app.post('/api/auth/signup', handleSignup);
  app.post('/api/auth/register', handleSignup);

  const handleSignin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await authenticateUser(email, password);
      // Ensure Supabase has the latest profile
      supabaseSyncProfile(result.user).catch(() => {});
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid email or password.' });
    }
  };

  app.post('/api/auth/signin', handleSignin);
  app.post('/api/auth/login', handleSignin);

  app.get('/api/auth/me', (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json({ user: req.user });
  });

  const handleSignout = (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Signed out successfully.' });
  };

  app.post('/api/auth/signout', handleSignout);
  app.post('/api/auth/logout', handleSignout);

  // Profile customization endpoint (rename, change photo, update department/designation)
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const targetUserId =
      req.user?.id ||
      (req.headers['x-user-id'] as string) ||
      req.body.id ||
      (req.body.role ? DEMO_USERS[String(req.body.role).toLowerCase()]?.id : undefined) ||
      'user-hod-01';

    try {
      const { name, avatarUrl, departmentName, designation, identifier, phone } = req.body;
      const updated = updateUserProfile(targetUserId, {
        name,
        avatarUrl,
        departmentName,
        designation,
        identifier,
        phone
      });
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile' });
    }
  });

  app.post('/api/auth/profile', (req: Request, res: Response) => {
    const targetUserId =
      req.user?.id ||
      (req.headers['x-user-id'] as string) ||
      req.body.id ||
      (req.body.role ? DEMO_USERS[String(req.body.role).toLowerCase()]?.id : undefined) ||
      'user-hod-01';

    try {
      const { name, avatarUrl, departmentName, designation, identifier, phone } = req.body;
      const updated = updateUserProfile(targetUserId, {
        name,
        avatarUrl,
        departmentName,
        designation,
        identifier,
        phone
      });
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile' });
    }
  });

  // Demo accounts lookup for 1-click evaluator testing
  app.get('/api/users/demo', (req: Request, res: Response) => {
    res.json({ users: DEMO_USERS });
  });

  // ==========================================
  // CORE RULE: NO HOD APPROVAL = NO PUBLIC EVENT
  // Public events endpoint: STRICTLY queries status === 'PUBLISHED'
  // Non-published, draft, pending review, or rejected events CANNOT be returned.
  // ==========================================
  app.get('/api/events/public', (req: Request, res: Response) => {
    const { search, category, department } = req.query;
    const events = getPublicEvents({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      department: typeof department === 'string' ? department : undefined
    });
    res.json({ events, total: events.length });
  });

  // Events list for authenticated users (scoped by role)
  app.get('/api/events', (req: Request, res: Response) => {
    const currentUser = req.user || DEMO_USERS.public;
    const events = getAllEvents(currentUser);
    res.json({ events, total: events.length });
  });

  // Single event detail (with access control)
  app.get('/api/events/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const event = getEventById(id, req.user);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found or access restricted: unapproved drafts cannot be viewed without proper credentials.'
      });
    }

    res.json({ event });
  });

  // Create event charter (FACULTY or HOD only)
  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Coordinators or HOD are authorized to create event charters.'
        });
      }
      const user = req.user;
      const { submitImmediately, ...eventData } = req.body;
      const newEvent = createEvent(eventData, user, !!submitImmediately);

      // Async sync with Supabase PostgreSQL
      supabaseSyncEvent(newEvent, user.role).catch((e) =>
        console.warn('[Supabase] Event sync notice:', e)
      );
      if (submitImmediately) {
        supabaseSyncApproval(newEvent.id, user.id, 'SUBMITTED', 'Submitted on proposal creation').catch(
          () => {}
        );
      }

      res.status(201).json({
        event: newEvent,
        message: submitImmediately
          ? 'Event created and queued for HOD statutory sign-off.'
          : 'Event draft saved successfully.'
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create event.' });
    }
  });

  // Update event charter (Organizer only, in DRAFT or CHANGES_REQUESTED)
  app.put('/api/events/:id', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Coordinators or HOD can modify event charters.'
        });
      }
      const { id } = req.params;
      const user = req.user;
      const updated = updateEvent(id, req.body, user);

      // Async sync with Supabase PostgreSQL
      supabaseSyncEvent(updated, user.role).catch((e) =>
        console.warn('[Supabase] Event update sync notice:', e)
      );

      res.json({ event: updated, message: 'Event charter updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update event.' });
    }
  });

  // Delete event draft
  app.delete('/api/events/:id', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Coordinators or HOD can delete event drafts.'
        });
      }
      const { id } = req.params;
      const user = req.user;
      deleteEvent(id, user);

      // Async delete from Supabase PostgreSQL
      supabaseDeleteEvent(id).catch((e) => console.warn('[Supabase] Event delete notice:', e));

      res.json({ success: true, message: 'Event deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to delete event.' });
    }
  });

  // Submit event for HOD review (FACULTY or HOD)
  app.post('/api/events/:id/submit', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Coordinators or HOD can submit events for statutory sign-off.'
        });
      }
      const { id } = req.params;
      const { comment } = req.body;
      const user = req.user;
      const updated = submitEventForApproval(id, user, comment);

      // Async sync status update and approval record to Supabase PostgreSQL
      supabaseSyncEvent(updated, user.role).catch((e) =>
        console.warn('[Supabase] Submit sync notice:', e)
      );
      supabaseSyncApproval(id, user.id, 'SUBMITTED', comment).catch((e) =>
        console.warn('[Supabase] Approval sync notice:', e)
      );

      res.json({
        event: updated,
        message: 'Event submitted to HOD statutory clearance queue.'
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to submit event.' });
    }
  });

  // ==========================================
  // HOD APPROVAL & REVIEW WORKFLOW (STRICT HOD ONLY)
  // ==========================================
  app.post('/api/events/:id/review', async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'HOD') {
        return res.status(403).json({
          error: 'Access denied: Statutory approval authority is restricted exclusively to the Head of Department (HOD).'
        });
      }

      const { id } = req.params;
      const { action, comment, reason } = req.body;

      if (!action || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(action)) {
        return res.status(400).json({ error: 'Valid review action (APPROVED, REJECTED, CHANGES_REQUESTED) required.' });
      }

      const reviewer = req.user;
      const updated = reviewEvent(id, reviewer, action, comment, reason);

      // Async sync approved status, digital signature, and approval log to Supabase PostgreSQL
      supabaseSyncEvent(updated, reviewer.role).catch((e) =>
        console.warn('[Supabase] Review sync notice:', e)
      );
      supabaseSyncApproval(id, reviewer.id, action, comment || reason).catch((e) =>
        console.warn('[Supabase] Review approval sync notice:', e)
      );

      res.json({
        event: updated,
        message:
          action === 'APPROVED'
            ? 'Event approved with statutory digital signature and published publicly!'
            : action === 'CHANGES_REQUESTED'
            ? 'Revisions requested. Organizing faculty notified.'
            : 'Event proposal rejected.'
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to process HOD review.' });
    }
  });

  // Bulk review events (HOD only batch database operation)
  app.post('/api/events/bulk-review', async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'HOD') {
        return res.status(403).json({
          error: 'Access denied: Bulk review authority is restricted exclusively to the Head of Department (HOD).'
        });
      }

      const { eventIds, action, comment, reason } = req.body;
      if (!Array.isArray(eventIds) || eventIds.length === 0) {
        return res.status(400).json({ error: 'Array of eventIds is required for batch review.' });
      }

      if (!action || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(action)) {
        return res.status(400).json({ error: 'Valid review action (APPROVED or REJECTED) is required.' });
      }

      // Execute atomic batch database operation updating events, digital signatures, audit logs and notifications
      const { updatedEvents, errors } = bulkReviewEvents(
        eventIds,
        req.user,
        action,
        comment,
        reason
      );

      // Asynchronously synchronize changes to Supabase PostgreSQL mirror
      for (const updated of updatedEvents) {
        supabaseSyncEvent(updated, req.user.role).catch(() => {});
        supabaseSyncApproval(updated.id, req.user.id, action, comment || reason).catch(() => {});
      }

      res.json({
        success: true,
        count: updatedEvents.length,
        events: updatedEvents,
        errors,
        message:
          action === 'APPROVED'
            ? `Successfully batch approved and published ${updatedEvents.length} event charter(s) with statutory digital signatures!`
            : `Successfully batch rejected ${updatedEvents.length} event proposal(s) with recorded audit justification.`
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Bulk review batch operation failed.' });
    }
  });

  // Mark event as completed (FACULTY or HOD)
  app.post('/api/events/:id/complete', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Organizers or HOD can mark events as completed.'
        });
      }
      const { id } = req.params;
      const actor = req.user;
      const updated = completeEvent(id, actor);

      supabaseSyncEvent(updated, actor.role).catch(() => {});

      res.json({ event: updated, message: 'Event concluded and marked as COMPLETED.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to complete event.' });
    }
  });

  // ==========================================
  // PARTICIPANT REGISTRATION & MANAGEMENT
  // ==========================================
  app.post('/api/events/:id/register', async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role === 'PUBLIC') {
        return res.status(401).json({
          error: 'Authentication required: Please sign in with your university account to register for this event.'
        });
      }

      const { id } = req.params;
      const registrant = req.user;
      const { seatZone, formResponseUrl, markAttendanceImmediately } = req.body;
      const result = registerStudent(id, registrant, {
        seatZone,
        formResponseUrl,
        markAttendanceImmediately: Boolean(markAttendanceImmediately)
      });

      // Sync registration and updated event count to Supabase PostgreSQL
      supabaseSyncRegistration(result.registration).catch((e) =>
        console.warn('[Supabase] Registration sync notice:', e)
      );
      supabaseSyncEvent(result.event).catch((e) =>
        console.warn('[Supabase] Capacity sync notice:', e)
      );

      res.status(201).json({
        success: true,
        registration: result.registration,
        event: result.event,
        message: result.registration.checkedIn
          ? 'Registration confirmed and live gate attendance logged in real-time!'
          : 'Registration confirmed. Official admission admit slip generated.'
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Real-time student gate attendance self check-in
  app.post('/api/events/:id/attend', async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role === 'PUBLIC') {
        return res.status(401).json({
          error: 'Authentication required: Please sign in to confirm your real-time attendance.'
        });
      }

      const { id } = req.params;
      const student = req.user;
      const result = recordStudentAttendance(id, student);

      // Sync real-time check-in to Supabase
      supabaseCheckInParticipant(result.registration.registrationId).catch((e) =>
        console.warn('[Supabase] Realtime attendance sync notice:', e)
      );
      supabaseSyncEvent(result.event).catch(() => {});

      res.json({
        success: true,
        registration: result.registration,
        event: result.event,
        message: `Attendance confirmed present in real-time at ${new Date(result.registration.checkedInAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to record real-time attendance.' });
    }
  });

  // Cancel student registration
  app.post('/api/events/:id/cancel-registration', async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role === 'PUBLIC') {
        return res.status(401).json({
          error: 'Authentication required: Please sign in to cancel your registration.'
        });
      }

      const { id } = req.params;
      const registrant = req.user;
      const result = cancelRegistration(id, registrant);

      // Sync cancellation to Supabase PostgreSQL
      supabaseCancelRegistration(id, registrant.id).catch((e) =>
        console.warn('[Supabase] Cancel sync notice:', e)
      );
      supabaseSyncEvent(result.event).catch(() => {});

      res.json({ success: true, message: 'Registration cancelled. Seat released.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Cancellation failed.' });
    }
  });

  // Student's registered passes
  app.get('/api/student/registrations', (req: Request, res: Response) => {
    const studentId = req.user?.id || DEMO_USERS.student.id;
    let registrations = getStudentRegistrations(studentId);
    if (registrations.length === 0 && studentId !== DEMO_USERS.student.id) {
      registrations = getStudentRegistrations(DEMO_USERS.student.id);
    }
    res.json({ registrations, total: registrations.length });
  });

  // Organizer: Event participant roster (FACULTY, HOD, or GATE_SECURITY)
  app.get('/api/events/:id/participants', (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD', 'GATE_SECURITY'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Organizers, HOD, or Gate Security can view participant rosters.'
        });
      }
      const { id } = req.params;
      const actor = req.user;
      const participants = getEventParticipants(id, actor);
      res.json({ participants, total: participants.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to fetch participant roster.' });
    }
  });

  // Organizer: Manually admit participant (FACULTY or HOD only)
  app.post('/api/events/:id/participants/:regId/admit', (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Organizers or HOD can admit participants.'
        });
      }
      const { regId } = req.params;
      const actor = req.user;
      const result = admitParticipantManually(regId, actor);

      // Sync checked-in status to Supabase
      supabaseCheckInParticipant(regId).catch((e) =>
        console.warn('[Supabase] Manual admit sync notice:', e)
      );

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to admit participant.' });
    }
  });

  // Organizer: Remove participant from roster (FACULTY or HOD only)
  app.delete('/api/events/:id/participants/:regId', (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Only Faculty Organizers or HOD can remove participants.'
        });
      }
      const { id, regId } = req.params;
      const actor = req.user;
      const result = removeParticipantByOrganizer(regId, actor);

      // Sync cancellation to Supabase
      supabaseCancelRegistration(id, regId).catch(() => {});

      res.json({ success: true, message: 'Participant removed and seat released.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to remove participant.' });
    }
  });

  // Department / Security All Participants Roster
  app.get('/api/participants', (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD', 'GATE_SECURITY'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Viewing attendee lists is restricted to Faculty, HOD, and Gate Security.'
        });
      }
      const participants = getAllParticipants(req.user);
      res.json({ participants, total: participants.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to fetch participants.' });
    }
  });

  // ==========================================
  // GATE ATTENDANCE & QR SCANNER (FACULTY, HOD, or GATE_SECURITY)
  // ==========================================
  app.post('/api/check-in', async (req: Request, res: Response) => {
    try {
      if (!req.user || !['FACULTY', 'HOD', 'GATE_SECURITY'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied: Gate check-in terminal is restricted to Faculty Coordinators, HOD, and Gate Security.'
        });
      }

      const { registrationId } = req.body;
      if (!registrationId || typeof registrationId !== 'string') {
        return res.status(400).json({ error: 'Registration ID or pass code is required.' });
      }

      const actor = req.user;
      const result = checkInParticipant(registrationId, actor);

      // Sync check-in to Supabase PostgreSQL
      supabaseCheckInParticipant(registrationId).catch((e) =>
        console.warn('[Supabase] Check-in sync notice:', e)
      );

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Check-in validation failed.' });
    }
  });

  // Real-time Database Status & Supabase Connection Health
  app.get('/api/database/status', async (_req: Request, res: Response) => {
    const status = await getDatabaseStatus();
    res.json(status);
  });

  // ==========================================
  // NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  app.get('/api/notifications', (req: Request, res: Response) => {
    const user = req.user || null;
    const notifications = getUserNotifications(user);
    res.json({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  });

  app.post('/api/notifications/read', (req: Request, res: Response) => {
    const user = req.user || null;
    markNotificationsAsRead(user);
    const notifications = getUserNotifications(user);
    res.json({ success: true, notifications, unreadCount: 0 });
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const user = req.user || DEMO_USERS.hod;
    const auditLogs = getAuditLogs(user);
    res.json({ auditLogs, total: auditLogs.length });
  });

  app.post('/api/seed/reset', (req: Request, res: Response) => {
    resetDatabase();
    res.json({ success: true, message: 'Database reset to initial production seed state.' });
  });

  // ==========================================
  // AI EVENT COPILOT (GEMINI API)
  // ==========================================
  app.post('/api/copilot/suggest', async (req: Request, res: Response) => {
    const { prompt, department } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getAIClient();
    if (!ai) {
      // High-quality structured fallback
      return res.json({
        suggestion: {
          title: prompt.length > 5 ? prompt.split('.')[0] : 'Advanced Technical Workshop',
          shortDescription: `Curriculum-aligned practical workshop focusing on real-world implementations and system architecture.`,
          description: `This university department activity equips students with hands-on foundational architectures and system design principles. Structured in accordance with Outcome-Based Education (OBE) and NAAC Criterion 1 & 2 metrics, participants will build and evaluate modular code artifacts using computational sandboxes.\n\nKey themes include distributed engineering, state validation, and scalable project deployment.`,
          objectives: [
            'Equip students with hands-on foundational architectures and system design.',
            'Build and evaluate modular code artifacts using campus computational sandboxes.',
            'Demonstrate compliant engineering practices aligned with university syllabus standards.'
          ],
          category: 'Workshop',
          eventType: 'Hands-on Technical Workshop',
          syllabusMapping: 'CSE-8402: Module 4 & 5 (Outcome-Based Education Aligned)',
          academicCredits: 2.0,
          agenda: [
            {
              id: 'ag-1',
              time: '09:30 AM - 10:45 AM',
              sessionTitle: 'Foundations & Architecture Walkthrough',
              description: 'Core concepts, design patterns, and system requirements.'
            },
            {
              id: 'ag-2',
              time: '11:00 AM - 01:00 PM',
              sessionTitle: 'Interactive Lab & Sandbox Prototyping',
              description: 'Guided hands-on laboratory exercises with mentor support.'
            }
          ],
          requirements: {
            prerequisites: 'Foundational programming knowledge in Python or TypeScript.',
            thingsToBring: 'Personal laptop with charger, university student ID card.',
            softwareTools: 'VS Code or modern IDE, Node.js 20+ runtime.'
          }
        },
        aiPowered: false
      });
    }

    try {
      const promptContent = `You are an academic curriculum coordinator for Vignan University's ${department || 'Department of Computer Science & Engineering'}.
Create a complete, realistic, curriculum-aligned university event charter based on this faculty idea:
"${prompt}"

Output MUST be strictly valid JSON matching this schema:
{
  "title": "string (professional, academic title)",
  "shortDescription": "string (1-2 sentences)",
  "description": "string (comprehensive overview of session objectives, academic rigor, and practical pedagogy)",
  "objectives": ["string (Outcome-Based Education / Bloom's taxonomy aligned outcome)", "string", "string"],
  "category": "Workshop" | "Technical" | "Hackathon" | "Seminar" | "Guest Lecture" | "Competition",
  "eventType": "string (e.g. Hands-on Technical Workshop)",
  "syllabusMapping": "string (e.g. CSE-8402: Module 4 & 5 OBE Aligned)",
  "academicCredits": 2.0,
  "agenda": [
    { "id": "ag-1", "time": "09:30 AM - 10:45 AM", "sessionTitle": "string", "description": "string" },
    { "id": "ag-2", "time": "11:00 AM - 01:00 PM", "sessionTitle": "string", "description": "string" }
  ],
  "requirements": {
    "prerequisites": "string",
    "thingsToBring": "string",
    "softwareTools": "string"
  }
}`;

      const response = await callGeminiWithFallbacks(ai, promptContent);
      const text = response.text || '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ suggestion: parsed, aiPowered: true });
      }

      throw new Error('Could not parse JSON response from Gemini');
    } catch (err: any) {
      console.warn('Gemini copilot generation failed or exhausted, using structured template:', err.message || err);
      return res.json({
        suggestion: {
          title: prompt.length > 5 ? prompt.split('.')[0] : 'Advanced Hands-on Technical Workshop',
          shortDescription: `Curriculum-aligned practical workshop focusing on real-world implementations and system architecture.`,
          description: `This university department activity equips students with hands-on foundational architectures and system design principles. Structured in accordance with Outcome-Based Education (OBE) and NAAC Criterion 1 & 2 metrics, participants will build and evaluate modular code artifacts using computational sandboxes.\n\nKey themes include distributed engineering, state validation, and scalable project deployment.`,
          objectives: [
            'Equip students with hands-on foundational architectures and system design.',
            'Build and evaluate modular code artifacts using campus computational sandboxes.',
            'Demonstrate compliant engineering practices aligned with university syllabus standards.'
          ],
          category: 'Workshop',
          eventType: 'Hands-on Technical Workshop',
          syllabusMapping: 'CSE-8402: Module 4 & 5 (Outcome-Based Education Aligned)',
          academicCredits: 2.0,
          agenda: [
            {
              id: 'ag-1',
              time: '09:30 AM - 10:45 AM',
              sessionTitle: 'Foundations & Architecture Walkthrough',
              description: 'Core concepts, design patterns, and system requirements.'
            },
            {
              id: 'ag-2',
              time: '11:00 AM - 01:00 PM',
              sessionTitle: 'Interactive Lab & Sandbox Prototyping',
              description: 'Guided hands-on laboratory exercises with mentor support.'
            }
          ],
          requirements: {
            prerequisites: 'Foundational programming knowledge in Python or TypeScript.',
            thingsToBring: 'Personal laptop with charger, university student ID card.',
            softwareTools: 'VS Code or modern IDE, Node.js 20+ runtime.'
          }
        },
        aiPowered: false
      });
    }
  });

  // ==========================================
  // POST-EVENT FEEDBACK & PERFORMANCE METRICS
  // ==========================================
  app.post('/api/events/:id/feedback', (req: Request, res: Response) => {
    try {
      const user = req.user || DEMO_USERS.student;
      const { rating, contentQuality, organization, speakerRating, comment, takeaways, wouldRecommend } = req.body;
      if (!rating) {
        return res.status(400).json({ error: 'Overall rating is required.' });
      }
      const record = submitFeedback(req.params.id, user, {
        rating: Number(rating),
        contentQuality: contentQuality ? Number(contentQuality) : undefined,
        organization: organization ? Number(organization) : undefined,
        speakerRating: speakerRating ? Number(speakerRating) : undefined,
        comment: comment || '',
        takeaways: takeaways || '',
        wouldRecommend: wouldRecommend !== false
      });
      res.json({ success: true, feedback: record });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to submit feedback.' });
    }
  });

  app.get('/api/events/:id/feedbacks', (req: Request, res: Response) => {
    try {
      const result = getEventFeedbacks(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to fetch event feedbacks.' });
    }
  });

  app.get('/api/student/feedbacks', (req: Request, res: Response) => {
    const user = req.user || DEMO_USERS.student;
    const feedbacks = getStudentFeedbacks(user.id);
    res.json({ feedbacks });
  });

  app.get('/api/faculty/feedback-summary', (req: Request, res: Response) => {
    const summary = getAllFeedbackMetrics();
    res.json(summary);
  });

  // ==========================================
  // AI VIRTUAL CAMPUS ASSISTANT
  // ==========================================
  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    const { message, history = [], activeView = 'discover', currentEvents = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const user = req.user || DEMO_USERS.student;
    const dbEvents = getAllEvents(user);

    // Merge client-sent real-time events with database events
    const eventMap = new Map<string, DepartmentEvent>();
    dbEvents.forEach(e => eventMap.set(e.id, e));
    if (Array.isArray(currentEvents)) {
      currentEvents.forEach((e: DepartmentEvent) => {
        if (e && e.id) eventMap.set(e.id, e);
      });
    }
    const events = Array.from(eventMap.values());
    const publicEvents = events.filter(e => e.status === 'PUBLISHED');
    const feedbackMetrics = getAllFeedbackMetrics();

    // Calculate real-time countdown info for each event
    const now = Date.now();
    const eventsSummary = events.map(e => {
      let countdownStr = 'Scheduled';
      let hoursUntil = 999;
      try {
        const [y, m, d] = (e.date || '').split('-').map(Number);
        const [h, min] = (e.startTime || '09:30').replace(/[^\d:]/g, '').split(':').map(Number);
        const eventTime = new Date(y, (m || 1) - 1, d || 1, h || 9, min || 0).getTime();
        const diff = eventTime - now;
        hoursUntil = diff / (1000 * 60 * 60);

        if (diff < 0) {
          countdownStr = 'Happening today or already concluded';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / (1000 * 60)) % 60);
          countdownStr = `${days}d ${hours}h ${mins}m remaining (Countdown active on page)`;
        }
      } catch (err) {
        countdownStr = `Scheduled for ${e.date} at ${e.startTime}`;
      }

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        status: e.status,
        date: e.date,
        time: `${e.startTime} - ${e.endTime}`,
        countdown: countdownStr,
        venue: e.venue,
        capacity: e.capacity,
        registered: e.registeredCount,
        seatsRemaining: Math.max(0, e.capacity - e.registeredCount),
        credits: e.academicCredits || 1.0,
        organizer: e.organizerName,
        department: e.departmentName,
        description: e.description,
        speaker: e.speaker?.name || 'Department Faculty Coordinator',
        prerequisites: e.requirements?.prerequisites || 'None'
      };
    });

    const ai = getAIClient();
    if (ai) {
      try {
        const systemPrompt = `You are "CampusFlow AI", the official intelligent virtual assistant for Vignan University's Departmental Event & Governance Portal.
Your job is to provide accurate, comprehensive, and helpful answers about ALL pages in the portal and ALL events in the system.

CURRENT REAL-TIME SYSTEM CONTEXT:
- Active User: ${user.name} (Role: ${user.role}, Department: ${user.departmentName || 'Computer Science & Engineering'})
- Current Active View: ${activeView}
- All Events Present in System (Live & Updated):
${JSON.stringify(eventsSummary, null, 2)}
- Feedback Metrics: Overall Student Rating: ${feedbackMetrics.overallRating}/5.0 with ${feedbackMetrics.totalFeedbacks} verified reviews.

ALL PORTAL PAGES & CAPABILITIES:
1. Public Catalog (/discover): Browse all approved events, live countdown timers on every card, filter by category (Technical Workshop, Hackathon, Research Seminar, Cultural Fest, Career Prep), search by keyword, view full syllabus modal, and enroll in confirmed seats without needing any login.
2. Events Calendar (/calendar): Interactive monthly calendar displaying upcoming department events, live countdown badge, date selection filters, and calendar export (Google Calendar, Microsoft Outlook, and offline ICS).
3. My Registrations (/my-passes): Student registration hub displaying confirmed seats, unique confirmation IDs, designated seat zones, live event countdown timers, "Print Admit Slip" for clean browser printing, "Download Slip (PNG)", and post-event rating buttons.
4. HOD Review Queue (/hod-review): Statutory governance hub where Head of Department reviews pending event charters, verifies compliance, signs with cryptographic digital approval seal, requests revisions, or declines.
5. Propose Event Charter: Faculty and HOD can click "+ Propose Event" in the navigation bar to submit new events directly to the HOD review queue.
6. Profile & Photo Customizer: Accessible by clicking the user avatar or "Customize Profile" in the user menu. Allows updating display name, designation, department, institutional roll number/ID, and uploading a personal photo or custom avatar.
7. Print Admit Slip: Available in My Registrations when clicking "View Admit Slip", formatting a clean, printer-friendly Vignan University pass with roll number, seat zone, barcode, and HOD statutory seal.

INSTRUCTIONS:
- When asked what events are on the page or present in the system, list EVERY event with its title, date, time, venue, remaining seats, and its live countdown!
- When asked about countdown or timers, state the exact countdown timer information for the events.
- When asked about any specific event, provide its exact schedule, venue, faculty coordinator, credits, and syllabus details.
- Always provide clear, accurate information matching the current events present.`;

        const conversationHistory = history
          .slice(-6)
          .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n');

        const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nUser: ${message}\nAssistant:`;

        const response = await callGeminiWithFallbacks(ai, prompt);
        const reply = response.text || 'I am here to assist with all Vignan University departmental events, approvals, registrations, and feedback.';
        return res.json({ reply, aiPowered: true });
      } catch (err: any) {
        console.error('Gemini assistant error, falling back to local campus intelligence:', err);
      }
    }

    // Intelligent Fallback Campus Virtual Assistant (Rule & Comprehensive Campus Intelligence)
    const lower = message.toLowerCase();
    let reply = '';

    // Check if the query asks about all pages
    if (lower.includes('all pages') || lower.includes('every page') || lower.includes('pages in this portal') || lower.includes('explain all pages') || lower.includes('what pages')) {
      reply = `Here is a complete guide to all pages and sections in the Vignan CampusFlow Portal:\n\n` +
        `• **1. Public Catalog** (\`Public Catalog\` tab): Explore all university-approved events, filter by category (Technical, Hackathon, Seminars), check live countdown timers on every card, and enroll in seats (accessible to public without login).\n` +
        `• **2. Events Calendar** (\`Calendar\` tab): Monthly visual calendar with event markers, date filtering, live countdowns, and direct sync to Google Calendar, Outlook, and ICS files.\n` +
        `• **3. My Registrations & Admit Slips** (\`My Registrations\` tab): View confirmed enrollments, launch the **Print Admit Slip** browser print dialog, check live event countdowns, or download high-res PNG cards.\n` +
        `• **4. HOD Review Queue** (\`HOD Queue\` tab, for HOD): Statutory department clearance hub where the HOD reviews charters, applies cryptographic approval seals, or requests revisions.\n` +
        `• **5. Propose Event Charter** (\`+ Propose Event\` button): Faculty and HOD can submit new event charters directly for statutory clearance.\n` +
        `• **6. Profile & Photo Customizer** (Click user avatar or \`Customize Profile\`): Update your display name, title, department, roll number, and upload your profile photo.\n` +
        `• **7. Real Login Authentication** (\`Portal Sign In\`): Secure authentication for HOD and Faculty, while allowing the Public to browse freely without any login.`;
    }
    // Check if query asks about countdowns or timers
    else if (lower.includes('countdown') || lower.includes('timer') || lower.includes('how long') || lower.includes('starts next') || lower.includes('when does it start')) {
      const activeEvents = events.filter(e => e.status === 'PUBLISHED');
      reply = `Here are the active countdown timers for upcoming events on the page:\n\n` +
        activeEvents.map(e => {
          const item = eventsSummary.find(s => s.id === e.id);
          return `• **${e.title}**\n  ⏳ Countdown: **${item?.countdown || 'Scheduled'}**\n  📅 Date: ${e.date} | ⏰ ${e.startTime} - ${e.endTime}\n  📍 Venue: ${e.venue}`;
        }).join('\n\n') +
        `\n\nEach event card features a real-time ticking countdown timer showing days, hours, minutes, and seconds!`;
    }
    // Check if query matches a specific event title or keyword
    else if (events.some(e => lower.includes(e.title.toLowerCase()) || e.title.toLowerCase().split(' ').some(word => word.length > 4 && lower.includes(word)))) {
      const match = events.find(e => lower.includes(e.title.toLowerCase()) || e.title.toLowerCase().split(' ').some(word => word.length > 4 && lower.includes(word)))!;
      const item = eventsSummary.find(s => s.id === match.id);
      reply = `Here are the official details for **${match.title}**:\n\n` +
        `• **Category**: ${match.category}\n` +
        `• **Status**: ${match.status === 'PUBLISHED' ? '✅ Approved by HOD & Open for Registration' : match.status}\n` +
        `• **Live Countdown**: ⏳ **${item?.countdown || 'Active on card'}**\n` +
        `• **Date & Time**: 📅 ${match.date} | ⏰ ${match.startTime} - ${match.endTime}\n` +
        `• **Venue**: 📍 ${match.venue}\n` +
        `• **Faculty Coordinator / Speaker**: 👤 ${match.organizerName} (${match.speaker?.name || 'Department Faculty'})\n` +
        `• **Academic Credits**: 🎓 ${match.academicCredits || 2.0} Credits\n` +
        `• **Seat Allocation**: 👥 ${match.registeredCount}/${match.capacity} seats filled (${Math.max(0, match.capacity - match.registeredCount)} remaining)\n` +
        `• **Overview**: ${match.description}\n\n` +
        `You can find this event in the **Public Catalog** with an active live countdown timer or register your spot!`;
    }
    // Check if query asks about events present, upcoming, or on the page
    else if (lower.includes('event') || lower.includes('workshop') || lower.includes('what is happening') || lower.includes('upcoming') || lower.includes('present') || lower.includes('on the page') || lower.includes('list')) {
      const openEvents = events.filter(e => e.status === 'PUBLISHED');
      reply = `There are currently **${openEvents.length} official events** active and present on the page:\n\n` +
        openEvents.map(e => {
          const item = eventsSummary.find(s => s.id === e.id);
          return `• **${e.title}** (${e.category})\n  ⏳ Countdown: **${item?.countdown || 'Scheduled'}**\n  📅 Date: ${e.date} | ⏰ ${e.startTime} - ${e.endTime}\n  📍 Venue: ${e.venue} | 🎓 Credits: ${e.academicCredits || 2.0}\n  👥 Seats: ${e.registeredCount}/${e.capacity} filled (${Math.max(0, e.capacity - e.registeredCount)} remaining)`;
        }).join('\n\n') +
        `\n\nYou can click on any event in the **Public Catalog** to view full details or register, or switch to the **Calendar** view!`;
    } else if (lower.includes('calendar') || lower.includes('add to calendar') || lower.includes('google calendar') || lower.includes('date')) {
      reply = `You can view all events on the **Events Calendar**! In the top navigation, click the **"Calendar"** tab (or toggle "Calendar View" in the Public Catalog). You can also click **"Add to Calendar"** on any event card to sync it to Google Calendar, Microsoft Outlook, or download an iCal (.ics) file.`;
    } else if (lower.includes('pass') || lower.includes('ticket') || lower.includes('slip') || lower.includes('admit') || lower.includes('my registration') || lower.includes('cancel') || lower.includes('download') || lower.includes('offline') || lower.includes('png') || lower.includes('print')) {
      reply = `To access, print, or download your official student registration admit slip:\n• Click **"My Registrations"** in the top navigation bar.\n• Click **"View Admit Slip"** on any registered activity.\n• Click **"Print Admit Slip"** to trigger the browser's clean, printer-friendly print dialog formatted with official Vignan University letterhead!\n• You can also click **"Download Slip (PNG)"** to save a high-resolution admit card graphic.\n• The slip includes your Roll Number, Confirmation ID, seat zone, live countdown timer, and statutory HOD clearance seal.\n• If you cannot attend, click "Cancel Registration" to release your seat for another student.`;
    } else if (lower.includes('hod') || lower.includes('approval') || lower.includes('review') || lower.includes('publish') || lower.includes('workflow')) {
      reply = `The Department Governance workflow enforces strict university compliance:\n1. **Faculty Proposes Charter**: Faculty or HOD click "+ Propose Event" in the navigation bar to draft the charter.\n2. **HOD Clearance**: Submitted to the **HOD Review Queue**, where the Head of Department reviews charters, applies cryptographic approval seals, or requests revisions.\n3. **Public Release**: Once approved, events instantly appear in the Public Catalog and Calendar with live countdown timers!`;
    } else if (lower.includes('profile') || lower.includes('photo') || lower.includes('avatar') || lower.includes('name') || lower.includes('rename') || lower.includes('customize') || lower.includes('save') || lower.includes('saving')) {
      reply = `You can customize your profile anytime! Click your user pill/avatar in the top navigation bar and choose **"Customize Profile"**:\n• Update your official Name, Academic Designation, and Department.\n• Enter your Institutional ID or Roll Number.\n• Upload a photo directly from your device or select an avatar style.\n• Click **"Save Changes"** — changes are persisted to the university database and browser storage, updating all admit slips, navigation badges, and event charters instantly!`;
    } else if (lower.includes('login') || lower.includes('signin') || lower.includes('authenticate') || lower.includes('auth') || lower.includes('faculty') || lower.includes('public')) {
      reply = `The portal supports real multi-role authentication:\n• **Public / Guest**: Can browse the Public Catalog, view event schedules, and check countdowns without logging in.\n• **HOD & Faculty**: Click **"Portal Sign In"** in the top navigation to authenticate with verified institutional credentials or create a real account.\n• **HOD**: Gains access to the Statutory HOD Clearance Queue to review and digitally sign event charters.`;
    } else {
      reply = `Hello! I am your Vignan CampusFlow Virtual Assistant. I have complete real-time knowledge of all pages and events in the system:\n• **Live Events & Countdowns**: Ask "What events are on the page?" or "Show countdown timers".\n• **All Pages Guide**: Ask me to "Explain all pages in this portal" for a complete walkthrough.\n• **Print Admit Slips**: Ask how to print or download your official event entry pass.\n• **Profile Customization**: Ask how to change your display name or photo.\n• **HOD Governance**: Ask about HOD review and approval procedures.\n\nHow can I help you today?`;
    }

    return res.json({ reply, aiPowered: false });
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CAMPUSFLOW server running on port ${PORT}`);
  });
}

startServer();
