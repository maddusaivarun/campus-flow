export type UserRole = 'FACULTY' | 'HOD' | 'STUDENT' | 'PUBLIC' | 'GATE_SECURITY';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  identifier: string; // e.g. "FAC-CSE-4192", "HOD-CSE-1001", "CS-22-094"
  designation?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
}

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'ONGOING'
  | 'COMPLETED'
  | 'REJECTED';

export type EventCategory =
  | 'Workshop'
  | 'Technical'
  | 'Competition'
  | 'Hackathon'
  | 'Seminar'
  | 'Guest Lecture'
  | 'Club Activity'
  | 'Cultural Event';

export interface Speaker {
  name: string;
  designation: string;
  organization: string;
  bio: string;
  imageUrl?: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  sessionTitle: string;
  description: string;
  durationMinutes?: number;
}

export interface Requirements {
  prerequisites: string;
  thingsToBring: string;
  softwareTools: string;
  otherInstructions?: string;
}

export interface DepartmentEvent {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  objectives: string[];
  category: EventCategory;
  eventType: string; // e.g. "Hands-on Workshop", "Hackathon", "Keynote", "Bootcamp"
  departmentId: string;
  departmentName: string;
  organizerId: string;
  organizerName: string;
  organizerContact: string;
  organizerDesignation: string;
  posterUrl: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  locationDetails: string;
  capacity: number;
  registeredCount: number;
  attendanceCount?: number;
  registrationDeadline: string; // YYYY-MM-DD
  registrationRequired: boolean;
  targetAudience: string;
  eligibility: string;
  participationInstructions: string;
  externalLink?: string;
  registrationFormUrl?: string; // Form link space for student to join (Google Form / MS Form / Portal)
  speaker: Speaker;
  agenda: AgendaItem[];
  requirements: Requirements;
  status: EventStatus;
  academicCredits: number;
  syllabusMapping?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  hodReviewerName?: string;
  hodReviewComment?: string;
  digitalSignatureHash?: string;
  version: number;
}

export interface ApprovalTimelineRecord {
  id: string;
  eventId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'PUBLISHED' | 'COMPLETED';
  comment?: string;
  timestamp: string;
  signatureHash?: string;
}

export interface RegistrationRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentDepartment: string;
  registrationId: string; // e.g. "PASS-2026-8841-ALX"
  registeredAt: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  checkedIn: boolean;
  checkedInAt?: string;
  seatZone?: string;
  formResponseUrl?: string;
  qrToken?: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  read: boolean;
  createdAt: string;
  eventId?: string;
}

export interface AuditLogEntry {
  id: string;
  eventId?: string;
  action: string;
  actorName: string;
  actorRole: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FeedbackRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentDepartment?: string;
  rating: number; // 1 to 5
  contentQuality: number; // 1 to 5
  organization: number; // 1 to 5
  speakerRating: number; // 1 to 5
  comment: string;
  takeaways?: string;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface EventFeedbackMetrics {
  eventId: string;
  eventTitle: string;
  totalFeedbacks: number;
  averageRating: number;
  averageContentQuality: number;
  averageOrganization: number;
  averageSpeakerRating: number;
  recommendationPercentage: number;
  ratingDistribution: { [star: number]: number };
  recentFeedbacks: FeedbackRecord[];
}
