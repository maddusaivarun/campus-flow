import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
  BookOpen,
  Laptop,
  FileText,
  AlertCircle,
  ExternalLink,
  FileCheck,
  Link as LinkIcon,
  UserCheck
} from 'lucide-react';
import { DepartmentEvent, UserProfile, RegistrationRecord } from '../types';
import { AddToCalendarMenu } from './AddToCalendarMenu';
import { EventCountdownTimer } from './EventCountdownTimer';

interface EventDetailModalProps {
  event: DepartmentEvent | null;
  onClose: () => void;
  currentUser: UserProfile;
  isRegistered: boolean;
  registrationRecord?: RegistrationRecord;
  onRegister: (
    eventId: string,
    options?: { formResponseUrl?: string; markAttendanceImmediately?: boolean }
  ) => Promise<void>;
  onMarkAttendance?: (eventId: string) => Promise<void>;
  onViewPass: (registration: RegistrationRecord) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  currentUser,
  isRegistered,
  registrationRecord,
  onRegister,
  onMarkAttendance,
  onViewPass
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [formResponseUrl, setFormResponseUrl] = useState('');
  const [markAttendanceImmediately, setMarkAttendanceImmediately] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null);

  if (!event) return null;

  const seatsLeft = event.capacity - event.registeredCount;
  const isFull = seatsLeft <= 0;

  const handleRegisterClick = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onRegister(event.id, {
        formResponseUrl: formResponseUrl.trim() || undefined,
        markAttendanceImmediately
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendanceClick = async () => {
    if (!onMarkAttendance) return;
    setIsMarkingAttendance(true);
    setErrorMessage(null);
    setAttendanceSuccess(null);
    try {
      await onMarkAttendance(event.id);
      setAttendanceSuccess('✓ Attendance marked present in real time!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to record attendance.');
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header Banner */}
        <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-slate-900/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors backdrop-blur z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Header */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
              {event.category}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/20 text-white backdrop-blur">
              {event.eventType}
            </span>
            {event.academicCredits > 0 && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5" />
                {event.academicCredits} Academic Credits
              </span>
            )}
          </div>

          {/* Bottom Title on Header */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="text-xs text-blue-300 font-semibold mb-1">
              {event.departmentName}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-white">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Live Hero Event Countdown */}
          <EventCountdownTimer
            date={event.date}
            startTime={event.startTime}
            endTime={event.endTime}
            variant="hero"
          />

          {/* Key Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date & Time
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{event.date}</div>
              <div className="text-slate-500 dark:text-slate-400">{event.startTime} - {event.endTime}</div>
            </div>

            <div>
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Venue
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{event.venue}</div>
              <div className="text-slate-500 dark:text-slate-400 truncate">{event.locationDetails}</div>
            </div>

            <div>
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Registered
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {event.registeredCount} / {event.capacity}
              </div>
              <div className={isFull ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                {isFull ? 'Full' : `${seatsLeft} seats left`}
              </div>
            </div>

            <div>
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Attendance
              </div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {event.attendanceCount || 0} Present
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Real-Time Roster
              </div>
            </div>

            <div>
              <div className="text-slate-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory Status
              </div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> HOD Cleared
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px] truncate" title={event.digitalSignatureHash}>
                Sig: {event.digitalSignatureHash?.slice(0, 10) || '0x4f892a'}...
              </div>
            </div>
          </div>

          {/* Statutory Sign-off Callout */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <span className="font-bold">Institutional Approval Verified: </span>
                <span>
                  Approved by {event.hodReviewerName || 'Head of Department'}. Verified under CSBS & IoT departmental statutory guidelines.
                </span>
              </div>
            </div>
            {event.publishedAt && (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono hidden sm:inline">
                Published: {new Date(event.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Real-time Join / Registration Form Link Workspace */}
          {!isRegistered && (
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200 font-display flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Student Joining Form & Real-Time Attendance
                </h4>
                {event.registrationFormUrl && (
                  <a
                    href={event.registrationFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 shadow-xs w-fit"
                  >
                    <span>Open External Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Form Link Space to Join <span className="text-slate-400 font-normal">(Google Form, Survey, or Portal Response URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g., https://forms.google.com/d/e/... or your submission link"
                  value={formResponseUrl}
                  onChange={(e) => setFormResponseUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provide your form response or join link here before confirming registration.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="realtime-attendance-check"
                  checked={markAttendanceImmediately}
                  onChange={(e) => setMarkAttendanceImmediately(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="realtime-attendance-check" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  Add my attendance in real time in the live event attendance roster upon confirmation
                </label>
              </div>
            </div>
          )}

          {/* If already registered: Show real-time attendance check-in status & button */}
          {isRegistered && (
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Attendance Status:</span>
                  {registrationRecord?.checkedIn ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[11px]">
                      ✓ Present in Real-Time Roster
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium text-[11px]">
                      Registered (Pending Attendance Check-in)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {registrationRecord?.checkedIn
                    ? `Confirmed present at ${new Date(registrationRecord.checkedInAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Seat: ${registrationRecord.seatZone || 'General'}`
                    : 'Click below to confirm your presence at the venue in real time.'}
                </div>
                {attendanceSuccess && (
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    {attendanceSuccess}
                  </div>
                )}
              </div>

              {!registrationRecord?.checkedIn && (
                <button
                  onClick={handleAttendanceClick}
                  disabled={isMarkingAttendance}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  {isMarkingAttendance ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging Attendance...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Confirm Attendance Present
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Activity Briefing
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description || event.shortDescription}
            </p>
          </div>

          {/* Learning Objectives */}
          {event.objectives && event.objectives.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Accreditation & Learning Outcomes (OBE Aligned)
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {event.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
              {event.syllabusMapping && (
                <div className="text-xs text-slate-500 italic mt-1">
                  Course Mapping: {event.syllabusMapping}
                </div>
              )}
            </div>
          )}

          {/* Speaker Profile */}
          {event.speaker && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                Resource Person / Keynote Speaker
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {event.speaker.imageUrl ? (
                  <img
                    src={event.speaker.imageUrl}
                    alt={event.speaker.name || 'Guest Speaker'}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {(event.speaker.name || 'S').charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{event.speaker.name || 'Distinguished Speaker'}</h4>
                  <p className="text-xs text-blue-700 font-medium">{event.speaker.designation || 'Keynote Expert'} • {event.speaker.organization || 'Vignan'}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.speaker.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agenda Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Session Schedule & Agenda
              </h3>
              <div className="space-y-2 border-l-2 border-blue-200 pl-4 ml-2">
                {event.agenda.map((ag) => (
                  <div key={ag.id} className="relative group pb-3 last:pb-0">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-blue-700">{ag.time}</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{ag.sessionTitle}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{ag.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements and Prerequisites */}
          {event.requirements && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                Participation Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Prerequisites</span>
                  <p className="text-slate-600">{event.requirements.prerequisites || 'None'}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Items to Bring</span>
                  <p className="text-slate-600">{event.requirements.thingsToBring || 'University ID card'}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Software / Tools</span>
                  <p className="text-slate-600">{event.requirements.softwareTools || 'Standard browser'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Organizer Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-500">Faculty Convenor: </span>
              <span className="font-semibold text-slate-900">{event.organizerName}</span>
              <span className="text-slate-500"> ({event.organizerDesignation})</span>
            </div>
            <div className="text-slate-600 font-mono text-[11px]">
              {event.organizerContact}
            </div>
          </div>
        </div>

        {/* Modal Footer / Registration Action Area */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {isRegistered ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>You hold a confirmed pass for this event</span>
              </div>
            ) : isFull ? (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Registration Full — Capacity reached</span>
              </div>
            ) : (
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Enrolling as: </span>
                <span>{currentUser?.name || 'Student'} ({currentUser?.identifier || 'ID'})</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Official registration admit slip generated upon confirmation.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AddToCalendarMenu event={event} variant="secondary" label="Sync to Calendar" />

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {isRegistered && registrationRecord ? (
              <button
                onClick={() => onViewPass(registrationRecord)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <FileCheck className="w-4 h-4" />
                View Admit Slip
              </button>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={isFull || isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isFull
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : isFull ? (
                  'Capacity Full'
                ) : (
                  'Confirm Registration'
                )}
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="px-6 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-medium border-t border-rose-200 dark:border-rose-900">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
