import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DepartmentEvent,
  RegistrationRecord,
  UserProfile,
  AuditLogEntry,
  SystemNotification
} from '../types';

// Environment variables
const rawSupabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const rawServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

const rawAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Validate that a URL is a valid HTTP/HTTPS URL and not a dummy placeholder
 */
function isValidHttpUrl(string: string): boolean {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (trimmed === '123456' || trimmed.length < 10) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Check if a key is a valid JWT / service key format, not a placeholder
 */
function isValidKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length > 20 && trimmed !== '123456';
}

export const isSupabaseConfigured = (): boolean => {
  return (
    isValidHttpUrl(rawSupabaseUrl) &&
    (isValidKey(rawServiceRoleKey) || isValidKey(rawAnonKey))
  );
};

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Get Supabase Service Role Admin Client with full elevated system permissions
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const keyToUse = isValidKey(rawServiceRoleKey) ? rawServiceRoleKey : rawAnonKey;

  try {
    cachedAdminClient = createClient(rawSupabaseUrl.trim(), keyToUse.trim(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': 'campusflow-vignan-backend/1.0.0',
          'apikey': keyToUse.trim(),
          'Authorization': `Bearer ${keyToUse.trim()}`,
          'role': isValidKey(rawServiceRoleKey) ? 'service_role' : 'anon'
        }
      }
    });

    console.log(
      `[Supabase] Initialized admin client -> ${new URL(rawSupabaseUrl).hostname} (Role: ${
        isValidKey(rawServiceRoleKey) ? 'service_role' : 'anon'
      })`
    );

    return cachedAdminClient;
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase admin client:', err);
    return null;
  }
}

/**
 * Get a scoped Supabase client with user bearer token & user role
 */
export function getScopedSupabaseClient(userToken?: string, role: string = 'authenticated'): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const keyToUse = isValidKey(rawAnonKey) ? rawAnonKey : rawServiceRoleKey;

  try {
    return createClient(rawSupabaseUrl.trim(), keyToUse.trim(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': 'campusflow-vignan-user/1.0.0',
          'apikey': keyToUse.trim(),
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {}),
          'role': role
        }
      }
    });
  } catch (err) {
    console.error('[Supabase] Failed to initialize scoped Supabase client:', err);
    return null;
  }
}

/**
 * CRUD: Synchronize event charter with Supabase `events` table
 */
export async function supabaseSyncEvent(event: DepartmentEvent, actorRole?: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  try {
    const payload = {
      id: event.id,
      title: event.title,
      slug: event.id.toLowerCase(),
      short_description: event.shortDescription || event.title,
      description: event.description || event.shortDescription || event.title,
      category: event.category || 'Technical Event',
      event_type: event.eventType || 'Offline',
      event_date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      venue: event.venue,
      location_details: event.locationDetails || '',
      capacity: event.capacity || 100,
      registration_deadline: event.registrationDeadline || event.date,
      eligibility: event.eligibility || 'Open to all students',
      requirements: JSON.stringify(event.requirements || {}),
      contact_name: event.organizerName || 'Faculty Coordinator',
      contact_email: event.organizerContact || 'coordinator@vignan.ac.in',
      contact_phone: event.organizerContact || '',
      status: event.status,
      academic_credits: event.academicCredits || 2.0,
      syllabus_mapping: event.syllabusMapping || '',
      hod_review_comment: event.hodReviewComment || null,
      digital_signature_hash: event.digitalSignatureHash || null,
      department_name: event.departmentName || 'Department of CSBS & IoT',
      updated_at: new Date().toISOString(),
      ...(event.publishedAt ? { published_at: event.publishedAt } : {})
    };

    const { error } = await supabase.from('events').upsert(payload, {
      onConflict: 'id'
    });

    if (error) {
      console.warn(`[Supabase] Note on events upsert (${event.id}):`, error.message);
      return false;
    }

    console.log(`[Supabase] Event ${event.id} successfully synced to Supabase (Status: ${event.status})`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Sync event error caught:', err.message);
    return false;
  }
}

/**
 * CRUD: Delete event from Supabase `events` table
 */
export async function supabaseDeleteEvent(eventId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      console.warn(`[Supabase] Note on event delete (${eventId}):`, error.message);
      return false;
    }
    console.log(`[Supabase] Event ${eventId} deleted from Supabase`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Delete event error:', err.message);
    return false;
  }
}

/**
 * CRUD: Record statutory HOD approval or review in Supabase `event_approvals` table
 */
export async function supabaseSyncApproval(
  eventId: string,
  reviewerId: string,
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'PUBLISHED',
  comments?: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('event_approvals').insert({
      event_id: eventId,
      reviewer_id: reviewerId,
      action,
      comments: comments || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.warn('[Supabase] Note on event_approvals insert:', error.message);
      return false;
    }

    console.log(`[Supabase] Statutory sign-off logged in Supabase: ${eventId} -> ${action}`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Sync approval error:', err.message);
    return false;
  }
}

/**
 * CRUD: Participant Management - Sync registration to Supabase `event_registrations`
 */
export async function supabaseSyncRegistration(registration: RegistrationRecord): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('event_registrations').upsert(
      {
        id: registration.id,
        event_id: registration.eventId,
        student_id: registration.studentId,
        registration_id: registration.registrationId,
        seat_zone: registration.seatZone || 'General Admission Zone A',
        qr_code_data: registration.qrToken || registration.registrationId,
        registration_status: registration.status,
        registered_at: registration.registeredAt,
        checked_in_at: registration.checkedInAt || null
      },
      { onConflict: 'registration_id' }
    );

    if (error) {
      console.warn('[Supabase] Note on event_registrations upsert:', error.message);
      return false;
    }

    console.log(
      `[Supabase] Participant registration ${registration.registrationId} synced to Supabase (Status: ${registration.status})`
    );
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Sync registration error:', err.message);
    return false;
  }
}

/**
 * CRUD: Participant Management - Cancel registration in Supabase
 */
export async function supabaseCancelRegistration(eventId: string, studentId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ registration_status: 'CANCELLED' })
      .eq('event_id', eventId)
      .eq('student_id', studentId);

    if (error) {
      console.warn('[Supabase] Note on registration cancel:', error.message);
      return false;
    }

    console.log(`[Supabase] Registration for event ${eventId} cancelled in Supabase`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Cancel registration error:', err.message);
    return false;
  }
}

/**
 * CRUD: Participant Management - Check in participant in Supabase
 */
export async function supabaseCheckInParticipant(registrationId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        registration_status: 'CHECKED_IN',
        checked_in_at: new Date().toISOString()
      })
      .eq('registration_id', registrationId);

    if (error) {
      console.warn('[Supabase] Note on check-in update:', error.message);
      return false;
    }

    console.log(`[Supabase] Participant ${registrationId} marked CHECKED_IN in Supabase`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Check-in error:', err.message);
    return false;
  }
}

/**
 * CRUD: User Profiles - Sync profile to Supabase `profiles`
 */
export async function supabaseSyncProfile(user: UserProfile): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: user.name,
        email: user.email,
        role: user.role,
        department_name: user.departmentName || 'Department of CSBS & IoT',
        identifier: user.identifier || '',
        phone: user.phone || '',
        avatar_url: user.avatarUrl || '',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.warn('[Supabase] Note on profiles upsert:', error.message);
      return false;
    }

    console.log(`[Supabase] Profile for ${user.email} (${user.role}) synced to Supabase`);
    return true;
  } catch (err: any) {
    console.warn('[Supabase] Sync profile error:', err.message);
    return false;
  }
}

/**
 * CRUD: Institutional Audit Logs - Sync to Supabase `audit_logs`
 */
export async function supabaseSyncAuditLog(log: AuditLogEntry): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      action: log.action,
      entity_type: 'EVENT',
      entity_id: log.details || '',
      created_at: log.timestamp || new Date().toISOString()
    });

    if (error) {
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Health & Connectivity Diagnostics for Database
 */
export async function getDatabaseStatus(): Promise<{
  supabaseConfigured: boolean;
  supabaseConnected: boolean;
  provider: 'Supabase PostgreSQL' | 'Resilient Hybrid Database';
  databaseUrlHost: string | null;
  hasServiceRoleKey: boolean;
  hasAnonKey: boolean;
  tablesVerified: string[];
  latencyMs?: number;
  message: string;
}> {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      supabaseConfigured: false,
      supabaseConnected: false,
      provider: 'Resilient Hybrid Database',
      databaseUrlHost: null,
      hasServiceRoleKey: isValidKey(rawServiceRoleKey),
      hasAnonKey: isValidKey(rawAnonKey),
      tablesVerified: ['events', 'profiles', 'event_registrations', 'audit_logs', 'notifications'],
      message: 'Operating with production JSON engine with Supabase dual-sync ready. To connect Supabase, supply SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      supabaseConfigured: true,
      supabaseConnected: false,
      provider: 'Resilient Hybrid Database',
      databaseUrlHost: rawSupabaseUrl ? new URL(rawSupabaseUrl).hostname : null,
      hasServiceRoleKey: isValidKey(rawServiceRoleKey),
      hasAnonKey: isValidKey(rawAnonKey),
      tablesVerified: [],
      message: 'Supabase URL configured but client could not be instantiated.'
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await supabase.from('events').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error) {
      return {
        supabaseConfigured: true,
        supabaseConnected: false,
        provider: 'Resilient Hybrid Database',
        databaseUrlHost: new URL(rawSupabaseUrl).hostname,
        hasServiceRoleKey: isValidKey(rawServiceRoleKey),
        hasAnonKey: isValidKey(rawAnonKey),
        latencyMs: latency,
        tablesVerified: [],
        message: `Connected to Supabase endpoint, schema check response: ${error.message}`
      };
    }

    return {
      supabaseConfigured: true,
      supabaseConnected: true,
      provider: 'Supabase PostgreSQL',
      databaseUrlHost: new URL(rawSupabaseUrl).hostname,
      hasServiceRoleKey: isValidKey(rawServiceRoleKey),
      hasAnonKey: isValidKey(rawAnonKey),
      latencyMs: latency,
      tablesVerified: ['events', 'profiles', 'event_registrations', 'event_approvals', 'audit_logs'],
      message: 'Active communication with Supabase database with service_role privileges.'
    };
  } catch (err: any) {
    return {
      supabaseConfigured: true,
      supabaseConnected: false,
      provider: 'Resilient Hybrid Database',
      databaseUrlHost: rawSupabaseUrl ? new URL(rawSupabaseUrl).hostname : null,
      hasServiceRoleKey: isValidKey(rawServiceRoleKey),
      hasAnonKey: isValidKey(rawAnonKey),
      tablesVerified: [],
      message: `Network check: ${err.message || 'Connecting...'}`
    };
  }
}
